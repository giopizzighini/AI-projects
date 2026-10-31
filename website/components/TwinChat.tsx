"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STARTERS = [
  "What kind of data roles are you targeting?",
  "Summarize your Itaú impact in 3 bullets.",
  "Are you open to relocating to the EU?",
  "What cloud platforms do you work with?",
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TwinChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I am Giovanni's digital twin. Ask about my career, stack, impact, or relocation. I stay inside the dossier on this site.",
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("twin:open", onOpen);
    return () => window.removeEventListener("twin:open", onOpen);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
    inputRef.current?.focus();
  }, [open, messages, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    setError("");
    setInput("");
    const userMessage: ChatMessage = { id: createId(), role: "user", content };
    const history = [...messages.filter((item) => item.id !== "welcome"), userMessage];
    const assistantId = createId();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "Thinking…" },
    ]);
    setBusy(true);

    try {
      const response = await fetch("/api/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((item) => ({ role: item.role, content: item.content })),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { reply?: string; error?: string }
        | null;

      if (!response.ok || !payload?.reply) {
        throw new Error(payload?.error || `Request failed (${response.status}).`);
      }

      setMessages((prev) =>
        prev.map((item) => (item.id === assistantId ? { ...item, content: payload.reply! } : item)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((prev) => prev.filter((item) => item.id !== assistantId));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  return (
    <>
      <section className="section twin" id="twin">
        <div className="wrap twin-grid">
          <div>
            <p className="kicker">05 — Digital Twin</p>
            <h2>Ask the dossier directly.</h2>
            <p className="twin-lead">
              A career twin grounded in this site&apos;s profile. Roles, impact, stack, languages,
              and relocation. Powered by NVIDIA Nemotron Ultra via OpenRouter&apos;s free tier.
            </p>
            <button type="button" className="btn btn-acid" onClick={() => setOpen(true)}>
              Open the twin
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
          <ul className="twin-prompts">
            {STARTERS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(true);
                    void send(prompt);
                  }}
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <button
        type="button"
        className={`twin-fab${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls="twin-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "Close digital twin" : "Open digital twin"}</span>
        <span aria-hidden="true">{open ? "×" : "DT"}</span>
      </button>

      <div
        id="twin-panel"
        className={`twin-panel${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Digital twin chat"
        hidden={!open}
      >
        <header className="twin-panel-head">
          <div>
            <p className="kicker">Digital Twin</p>
            <strong>Giovanni Pizzighini</strong>
          </div>
          <button type="button" className="twin-close" onClick={() => setOpen(false)}>
            Close
          </button>
        </header>

        <div className="twin-messages" ref={listRef}>
          {messages.map((message) => (
            <div key={message.id} className={`twin-bubble ${message.role}`}>
              <span>{message.role === "user" ? "You" : "Twin"}</span>
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        {error ? <p className="twin-error">{error}</p> : null}

        <form className="twin-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="twin-input">
            Ask the digital twin
          </label>
          <textarea
            id="twin-input"
            ref={inputRef}
            rows={2}
            value={input}
            disabled={busy}
            placeholder="Ask about roles, stack, impact…"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(input);
              }
            }}
          />
          <button type="submit" className="btn btn-acid" disabled={busy || !input.trim()}>
            {busy ? "Thinking" : "Send"}
          </button>
        </form>
      </div>
    </>
  );
}
