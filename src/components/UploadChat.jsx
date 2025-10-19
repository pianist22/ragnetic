// components/UploadChat.jsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, Send, FileText, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function UploadChat() {
  const [text, setText] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [isIndexing, setIsIndexing] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loader, setLoader] = React.useState(false);

  // Keep messages scrolled to the newest entry
  const bottomRef = React.useRef(null);
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const hasInput = text.trim().length > 0 || !!file;

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setFile(f);
  };

  // Index documents via /api/rag/index
  const onSubmit = async () => {
    if (!hasInput) return;
    setIsIndexing(true);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (text) formData.append("text", text);

      const res = await fetch("/api/index", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Indexing failed: " + (err.error || "Unknown error"));
        setIsIndexing(false);
        return;
      }

      setIsIndexing(false);
      setIsReady(true);
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "# Ready\n\nThe document has been indexed successfully; ask a question and a structured, cited answer will appear here. ",
          avatar: { src: "", alt: "Agent" },
        },
      ]);
    } catch (error) {
      alert("Indexing error: " + error.message);
      setIsIndexing(false);
    }
  };

  // Chat via /api/rag/chat
  const sendMessage = async () => {
    const content = input.trim();
    if (!content) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      avatar: { src: "", alt: "User" },
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      setLoader(true);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        setLoader(false);
        const err = await res.json();
        const errMsg = err?.error || "Unknown error";
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `# Error\n\n${errMsg}`,
            avatar: { src: "", alt: "Agent" },
          },
        ]);
        return;
      }
      setLoader(false);
      const data = await res.json();
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        // Expect Markdown “notebook” sections from the server per the improved prompt
        content: data.reply,
        avatar: { src: "", alt: "Agent" },
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (error) {
      setLoader(false);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `# Error\n\n${error.message}`,
          avatar: { src: "", alt: "Agent" },
        },
      ]);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-6 min-h-[calc(100vh-56px)] flex flex-col">
      {/* Heading */}
      <div className="mx-auto max-w-3xl text-center mb-6 sm:mb-8 px-1">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-snug">
          <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-400 bg-clip-text text-transparent">
            Retrieval‑Augmented Chat
          </span>
        </h1>
        <p className="mt-2 text-sm sm:text-lg text-muted-foreground mx-auto max-w-[42rem]">
          Paste long scripts or upload PDFs, index instantly, then chat with structured, cited answers.
        </p>
      </div>

      {/* Content grows to fill remaining viewport height */}
      <div className="relative flex-1">
        <AnimatePresence initial={false} mode="wait">
          {!isReady && (
            <motion.div
              key="collector"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              <div className="h-full grid place-items-center">
                <Card className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl p-4 sm:p-6 md:p-7 bg-background/80 backdrop-blur border">
                  <div className="grid gap-5">
                    <div className="grid gap-2">
                      <label className="text-sm sm:text-base font-medium">Paste text</label>
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your script, notes, or any long-form content…"
                        className="min-h-[160px] sm:min-h-[180px] resize-y"
                      />
                    </div>

                    <Separator />

                    <div className="grid gap-2">
                      <label className="text-sm sm:text-base font-medium">Upload PDF</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                        />
                        <Button type="button" variant="default" onClick={() => document.getElementById("hidden-pdf")?.click()}>
                          <Upload className="h-4 w-4" />
                          Choose
                        </Button>
                        <input
                          id="hidden-pdf"
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                        />
                      </div>
                      {file && (
                        <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {file.name}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <Button onClick={onSubmit} disabled={!hasInput || isIndexing} className="relative overflow-hidden">
                        {isIndexing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Indexing…
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              <AnimatePresence>
                {isIndexing && (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 grid place-items-center rounded-md"
                  >
                    <div className="rounded-md border bg-background/80 backdrop-blur p-6 shadow-xl">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Indexing document for chat…</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {isReady && (
            <motion.div
              key="chat-pane"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full grid gap-4 md:grid-cols-2"
            >
              {/* Left: compact collector */}
              <motion.div layout transition={{ type: "spring", stiffness: 220, damping: 26 }} className="order-2 md:order-1">
                <Card className="p-4 sm:p-5 h-full bg-background/80 backdrop-blur border">
                  <h3 className="text-sm font-medium mb-3">Document context</h3>
                  <div className="grid gap-3">
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Edit or add more context…"
                      className="min-h-[120px]"
                    />
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                      <Button type="button" variant="secondary" onClick={onSubmit}>
                        <Send className="h-4 w-4" />
                        Re-index
                      </Button>
                    </div>
                    {file && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        {file.name}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Right: chat UI (fills remaining viewport height and scrolls inside) */}
              <motion.div layout transition={{ type: "spring", stiffness: 220, damping: 26 }} className="order-1 md:order-2">
                <Card className="flex h-full min-h-[420px] flex-col bg-background/80 backdrop-blur border">
                  <div className="border-b p-4">
                    <h3 className="text-sm font-medium">Chat</h3>
                    <p className="text-xs text-muted-foreground">Ask anything grounded in the indexed content.</p>
                  </div>

                  {/* Messages area scrolls within the card */}
                  <ScrollArea className="flex-1 px-3 py-4 sm:px-4 overflow-y-auto">
                      <div className="flex flex-col gap-4">
                        {messages.map((m) => {
                          const isUser = m.role === "user";
                          return (
                            <div
                              key={m.id}
                              className={`flex items-start gap-3 ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              {/* Assistant Avatar */}
                              {!isUser && (
                                <Avatar className="h-8 w-8">
                                  {m.avatar?.src ? (
                                    <AvatarImage src={m.avatar.src} alt={m.avatar.alt ?? "Agent"} />
                                  ) : (
                                    <AvatarFallback className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                                      <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              )}

                              {/* Message bubble */}
                              <div
                                className={`max-w-[85%] sm:max-w-[80%] rounded-md px-0 py-0 ${
                                  isUser
                                    ? "ml-auto bg-primary text-primary-foreground shadow px-3 py-2"
                                    : "mr-auto bg-transparent"
                                }`}
                              >
                                {isUser ? (
                                  <div className="text-sm whitespace-pre-line">
                                    {m.content}
                                  </div>
                                ) : (
                                  <article className="prose prose-sm dark:prose-invert max-w-none p-3 sm:p-4 rounded-lg bg-muted">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {m.content}
                                    </ReactMarkdown>
                                  </article>
                                )}
                              </div>

                              {/* User Avatar */}
                              {isUser && (
                                <Avatar className="h-8 w-8">
                                  {m.avatar?.src ? (
                                    <AvatarImage src={m.avatar.src} alt={m.avatar.alt ?? "User"} />
                                  ) : (
                                    <AvatarFallback className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                      <UserIcon className="h-4 w-4" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              )}
                            </div>
                          );
                        })}

                        {/* Show Loader at the end if AI is responding */}
                        {loader && (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2 p-3 sm:p-4 bg-muted rounded-lg max-w-[70%]">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Assistant is thinking...</span>
                            </div>
                          </div>
                        )}

                        <div ref={bottomRef} />
                      </div>
                  </ScrollArea>

                  <div className="border-t p-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a question…"
                        autoComplete="off"
                      />
                      <Button type="submit">
                        <Send className="h-4 w-4" />
                        Send
                      </Button>
                    </form>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
