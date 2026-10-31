import { buildTwinSystemPrompt, sanitizeMessages, TWIN_MODELS } from "@/lib/twin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OpenRouterError = {
  error?: { message?: string };
};

type OpenRouterSuccess = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

async function callOpenRouter(model: string, messages: { role: string; content: string }[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      ok: false as const,
      status: 500,
      error: "OPENROUTER_API_KEY is not configured.",
    };
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Giovanni Pizzighini Digital Twin",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
      max_tokens: 700,
      stream: false,
      reasoning: { exclude: true },
    }),
  });

  let payload: OpenRouterError & OpenRouterSuccess = {};
  try {
    payload = (await response.json()) as OpenRouterError & OpenRouterSuccess;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      error: payload.error?.message || `OpenRouter returned ${response.status}.`,
    };
  }

  const reply = payload.choices?.[0]?.message?.content?.trim() ?? "";
  if (!reply) {
    return {
      ok: false as const,
      status: 502,
      error: "The model returned an empty answer.",
    };
  }

  return { ok: true as const, reply, model };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = sanitizeMessages(
    body && typeof body === "object" && "messages" in body
      ? (body as { messages: unknown }).messages
      : null,
  );

  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return Response.json({ error: "Send at least one user message." }, { status: 400 });
  }

  const last = messages[messages.length - 1];
  if (last.content.length > 1200) {
    return Response.json({ error: "Message is too long." }, { status: 400 });
  }

  const payload = [
    { role: "system", content: buildTwinSystemPrompt() },
    ...messages.map((message) => ({ role: message.role, content: message.content })),
  ];

  let lastError = "All free models are currently unavailable.";
  let lastStatus = 503;

  for (const model of TWIN_MODELS) {
    try {
      const result = await callOpenRouter(model, payload);
      if (!result.ok) {
        lastError = result.error;
        lastStatus = result.status;
        if (result.status === 429 || result.status === 503 || result.status === 502) {
          continue;
        }
        return Response.json({ error: result.error }, { status: result.status });
      }

      return Response.json({ reply: result.reply, model: result.model });
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Upstream request failed.";
      lastStatus = 502;
    }
  }

  return Response.json({ error: lastError }, { status: lastStatus });
}
