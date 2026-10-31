import {
  capabilities,
  certifications,
  education,
  languages,
  profile,
  roles,
} from "@/data/profile";

/**
 * Free OpenRouter models for career Q&A.
 * Nemotron Ultra is the strongest available free chat model that works for this use case.
 * Gemma 4 ranks highly but was rate-limited; Inkling free is restricted to agentic harnesses.
 */
export const TWIN_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3.5-lightning:free",
  "openrouter/free",
] as const;

export type TwinMessage = {
  role: "user" | "assistant";
  content: string;
};

export function buildTwinSystemPrompt() {
  const experience = roles
    .map((role) => {
      const impacts = role.impacts?.map((item) => `  - ${item}`).join("\n") ?? "";
      const tags = role.tags?.length ? `  Tags: ${role.tags.join(", ")}` : "";
      return [
        `${role.role} at ${role.company} (${role.start} — ${role.end}, ${role.location})`,
        `  ${role.summary}`,
        impacts,
        tags,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const skills = capabilities
    .map((item) => `${item.title}: ${item.text} Tools: ${item.tools.join(", ")}.`)
    .join("\n");

  const schooling = education
    .map((item) => `${item.school} — ${item.program} (${item.years})`)
    .join("\n");

  const langs = languages.map((item) => `${item.name}: ${item.level}`).join("; ");

  return `You are the Digital Twin of ${profile.name}, a ${profile.role} based in ${profile.location}.
You speak in first person as Giovanni. Tone: precise, confident, concise, professional with a slight edge. No corporate fluff. No emojis.

Purpose: answer questions about Giovanni's career, skills, background, education, languages, relocation readiness, and fit for roles. Stay inside the dossier below. If something is not in the dossier, say you do not have that detail and point people to ${profile.email} or LinkedIn (${profile.linkedin}).

Rules:
- Never invent employers, titles, dates, metrics, or tech you did not use.
- Prefer short answers: 2–5 sentences, or a short bullet list when comparing roles/skills.
- If asked for contact or hiring, share the email and LinkedIn.
- If asked to do unrelated work (code generation, general trivia, medical/legal advice), briefly refuse and steer back to career topics.
- You may answer in English, Portuguese, Spanish, or Italian to match the visitor.

DOSSIER
Name: ${profile.name}
Role: ${profile.role}
Location: ${profile.location}
Email: ${profile.email}
LinkedIn: ${profile.linkedin}
Summary: ${profile.summary}
Languages: ${langs}
Certifications: ${certifications.join("; ")}
Education:
${schooling}
Capabilities:
${skills}
Experience:
${experience}`;
}

export function sanitizeMessages(input: unknown): TwinMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item): item is TwinMessage => {
      if (!item || typeof item !== "object") return false;
      const message = item as TwinMessage;
      return (
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }))
    .slice(-12);
}
