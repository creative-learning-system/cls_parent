"use client";

import { useState, useRef, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Send, ChevronLeft, MessageSquare } from "lucide-react";
import type { Child } from "@/lib/dashboard-data";

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
};

export function MessagesSection({ child }: { child: Child }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(child.teachers[0]?.id ?? "");
  const [showChat, setShowChat] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTeacher = child.teachers.find((t) => t.id === selectedTeacherId);
  const conversation = selectedTeacherId ? (child.messages[selectedTeacherId] ?? []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTeacherId, conversation.length]);

  // Reset to first teacher when child changes
  useEffect(() => {
    setSelectedTeacherId(child.teachers[0]?.id ?? "");
    setShowChat(false);
  }, [child.id, child.teachers]);

  function handleSelectTeacher(id: string) {
    setSelectedTeacherId(id);
    setShowChat(true);
  }

  function handleSend() {
    if (!inputValue.trim()) return;
    setInputValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="show">
      <div className="surface-card overflow-hidden">
        <div className="flex h-[640px]">

          {/* ── Sidebar ─────────────────────────────────────── */}
          <div className={`flex w-full flex-col border-r border-border sm:w-72 sm:flex-shrink-0 ${showChat ? "hidden sm:flex" : "flex"}`}>

            {/* Sidebar header */}
            <div className="border-b border-border px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Teachers</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {child.name}&apos;s teachers
              </p>
            </div>

            {/* Teacher list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {child.teachers.map((teacher) => {
                const isActive = teacher.id === selectedTeacherId;
                const totalUnread = child.teachers.reduce((s, t) => s + t.unread, 0);
                void totalUnread;
                return (
                  <button
                    key={teacher.id}
                    onClick={() => handleSelectTeacher(teacher.id)}
                    className={`group flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-muted/50 ${
                      isActive
                        ? "border-r-2 border-r-[oklch(0.65_0.15_168)] bg-[oklch(0.65_0.15_168)]/6"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)] text-xs font-bold text-white">
                      {teacher.initials}
                      {teacher.unread > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[oklch(0.78_0.16_75)] text-[9px] font-bold text-white ring-2 ring-card">
                          {teacher.unread}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-sm font-semibold ${isActive ? "text-[oklch(0.45_0.13_168)]" : "text-foreground"}`}>
                          {teacher.name}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{teacher.lastTime}</span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">{teacher.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground/70">{teacher.lastMessage}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Chat panel ──────────────────────────────────── */}
          <div className={`flex flex-1 flex-col min-w-0 ${showChat ? "flex" : "hidden sm:flex"}`}>
            {selectedTeacher ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
                  <button
                    onClick={() => setShowChat(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted sm:hidden"
                    aria-label="Back"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[oklch(0.65_0.15_168)] text-xs font-bold text-white">
                    {selectedTeacher.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{selectedTeacher.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTeacher.subject} · {selectedTeacher.role}
                    </p>
                  </div>
                  {/* Online dot */}
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[oklch(0.68_0.17_145)]" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
                  <div className="flex flex-col gap-5">
                    {conversation.map((msg, idx) => {
                      const isTeacher = msg.from === "teacher";
                      const prevMsg = conversation[idx - 1];
                      const isFirstInGroup = !prevMsg || prevMsg.from !== msg.from;
                      const isLastInGroup = !conversation[idx + 1] || conversation[idx + 1].from !== msg.from;

                      return (
                        <div key={msg.id} className={`flex flex-col gap-1 ${isTeacher ? "items-start" : "items-end"}`}>
                          {/* Sender label — only on first bubble in group */}
                          {isFirstInGroup && (
                            <div className={`flex items-center gap-2 px-1 ${isTeacher ? "" : "flex-row-reverse"}`}>
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                                isTeacher ? "bg-[oklch(0.65_0.15_168)]" : "bg-[oklch(0.78_0.16_75)]"
                              }`}>
                                {msg.senderInitials}
                              </div>
                              <p className="text-[11px] font-medium text-muted-foreground">
                                {msg.senderName} · {isTeacher ? selectedTeacher.role : "Parent"}
                              </p>
                            </div>
                          )}

                          {/* Bubble */}
                          <div className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                            isTeacher
                              ? `bg-card border border-border text-foreground ${
                                  isFirstInGroup ? "rounded-2xl rounded-tl-sm" : "rounded-2xl"
                                }`
                              : `bg-[oklch(0.65_0.15_168)] text-white ${
                                  isFirstInGroup ? "rounded-2xl rounded-tr-sm" : "rounded-2xl"
                                }`
                          }`}>
                            {msg.text}
                          </div>

                          {/* Timestamp — only on last bubble in group */}
                          {isLastInGroup && (
                            <p className="px-1 text-[10px] text-muted-foreground">{msg.time}</p>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input area */}
                <div className="border-t border-border bg-card px-5 py-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 transition-colors focus-within:border-[oklch(0.65_0.15_168)]/50 focus-within:bg-card">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${selectedTeacher.name}…`}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.65_0.15_168)] text-white transition-all hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
                    Press Enter to send · Messages are reviewed by school staff
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Select a teacher to view messages</p>
                <p className="text-xs text-muted-foreground/60">Choose from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
