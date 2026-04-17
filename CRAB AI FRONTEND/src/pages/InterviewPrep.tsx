import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, FileText, MessageSquare, Send, Bot, User, RotateCcw,
  ChevronDown, Download, Code, Lightbulb, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getToken = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

const apiPost = async (endpoint: string, body: object) => {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

type Category = "technical" | "hr" | "behavioral" | "coding";

interface Question { text: string; category: Category; }
interface Message {
  id: string; role: "user" | "bot"; content: string;
  type?: "intro" | "question" | "feedback" | "answer_reveal" | "complete" | "switch";
  questionIndex?: number;
}

const CAT_COLOR: Record<Category, string> = {
  technical: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  hr:        "bg-green-500/10 text-green-600 dark:text-green-400",
  behavioral:"bg-purple-500/10 text-purple-600 dark:text-purple-400",
  coding:    "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

const isCodingRole = (role: string) => {
  const r = role.toLowerCase();
  return ["software","developer","engineer","programmer","backend","frontend","fullstack",
    "devops","sde","swe","ml","machine learning","data scientist","ai","game dev"].some(k => r.includes(k));
};

const isNonTechRole = (role: string) => {
  const r = role.toLowerCase();
  return ["hr","product manager","pm","marketing","sales","business analyst","content",
    "designer","ux","ui","finance","accountant","manager","analyst"].some(k => r.includes(k));
};

export default function InterviewPrep() {
  const [file,       setFile]       = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [company,    setCompany]    = useState("");
  const [difficulty, setDifficulty] = useState<"entry"|"mid"|"senior">("mid");
  const [qPerRound,  setQPerRound]  = useState(5);
  const [includeCoding, setIncludeCoding] = useState(true);

  const [isStarted,  setIsStarted]  = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [isTyping,   setIsTyping]   = useState(false);

  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState("");
  const [questions,  setQuestions]  = useState<Question[]>([]);
  const [qIndex,     setQIndex]     = useState(0);
  const [jobRole,    setJobRole]    = useState("");
  const [score,      setScore]      = useState({ good: 0, improve: 0, skipped: 0 });
  const [isDone,     setIsDone]     = useState(false);
  const [showAll,    setShowAll]    = useState(false);
  const [askedTexts, setAskedTexts] = useState<Set<string>>(new Set());

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const addMsg = useCallback((msg: Omit<Message, "id">) => {
    setMessages(p => [...p, { ...msg, id: Date.now().toString() + Math.random() }]);
  }, []);

  // ── Start interview ────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!targetRole.trim()) { toast.error("Please enter a target job role"); return; }
    setIsLoading(true);
    try {
      let resumeText = "";
      if (file) { try { resumeText = await file.text(); } catch {} }

      const showCoding = includeCoding && !isNonTechRole(targetRole) && isCodingRole(targetRole);
      // Use timestamp + random as seed to guarantee different questions every session
      const sessionSeed = Date.now().toString() + Math.floor(Math.random() * 100000);
      const data = await apiPost("/api/interview/generate", {
        resume_content: resumeText,
        job_role: targetRole,
        company: company || undefined,
        difficulty_level: difficulty,
        questions_per_round: qPerRound,
        include_coding: showCoding,
        session_seed: sessionSeed,
      });

      const technical:  string[] = data.technical  ?? [];
      const hr:         string[] = data.hr         ?? [];
      const behavioral: string[] = data.behavioral ?? [];
      const coding:     string[] = showCoding ? (data.coding ?? []) : [];

      const allQ: Question[] = [
        ...technical.map(t  => ({ text: t, category: "technical"  as Category })),
        ...hr.map(h          => ({ text: h, category: "hr"         as Category })),
        ...behavioral.map(b  => ({ text: b, category: "behavioral" as Category })),
        ...coding.map(c      => ({ text: c, category: "coding"     as Category })),
      ];

      if (allQ.length === 0) throw new Error("No questions");

      const unique = allQ.filter((q, i, self) =>
        self.findIndex(x => x.text.trim().toLowerCase() === q.text.trim().toLowerCase()) === i
      );

      setQuestions(unique); setQIndex(0); setJobRole(targetRole);
      setIsStarted(true); setIsDone(false);
      setScore({ good: 0, improve: 0, skipped: 0 });
      setAskedTexts(new Set());

      const byRound = {
        technical:  unique.filter(q => q.category === "technical").length,
        hr:         unique.filter(q => q.category === "hr").length,
        behavioral: unique.filter(q => q.category === "behavioral").length,
        coding:     unique.filter(q => q.category === "coding").length,
      };

      addMsg({
        role: "bot", type: "intro",
        content: `👋 **Welcome to your ${targetRole} interview${company ? ` at ${company}` : ""}!**\n\nI've prepared **${unique.length} questions**:\n🔵 ${byRound.technical} Technical\n🟢 ${byRound.hr} HR\n🟣 ${byRound.behavioral} Behavioral${byRound.coding > 0 ? `\n🟠 ${byRound.coding} Coding` : ""}\n\nAfter each answer I'll give you feedback. If you don't know an answer, type **"skip"** or **"show answer"** and I'll explain it.\n\nYou can also switch rounds anytime — type **"switch to hr"**, **"switch to coding"**, etc.\n\n**Let's begin!**`,
      });

      setTimeout(() => {
        addMsg({
          role: "bot", type: "question", questionIndex: 0,
          content: `**Question 1 of ${unique.length}** · ${unique[0].category.toUpperCase()}\n\n${unique[0].text}`,
        });
        setAskedTexts(new Set([unique[0].text.trim().toLowerCase()]));
      }, 400);
    } catch { toast.error("Could not generate questions. Please check your connection."); }
    finally { setIsLoading(false); }
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const ans = input.trim();
    if (!ans || isTyping) return;
    setInput("");
    addMsg({ role: "user", content: ans });
    setIsTyping(true);

    const currentQ = questions[qIndex];
    const ansLower = ans.toLowerCase();

    // ── Switch round command ─────────────────────────────────────────────────
    const switchMatch = ansLower.match(/switch\s+to\s+(technical|hr|behavioral|coding)/);
    if (switchMatch) {
      const targetCat = switchMatch[1] as Category;
      const nextQ = questions.find((q, i) => i > qIndex && q.category === targetCat);
      if (nextQ) {
        const ni = questions.indexOf(nextQ);
        setQIndex(ni);
        addMsg({
          role: "bot", type: "switch",
          content: `🔄 Switching to **${targetCat.toUpperCase()}** round!\n\n**Question ${ni + 1} of ${questions.length}** · ${targetCat.toUpperCase()}\n\n${nextQ.text}`,
        });
      } else {
        addMsg({ role: "bot", content: `No more ${targetCat} questions available. Continuing with the current round.` });
      }
      setIsTyping(false);
      return;
    }

    // ── Show answer / skip ────────────────────────────────────────────────────
    if (ansLower === "skip" || ansLower.includes("show answer") || ansLower.includes("don't know") || ansLower.includes("i don't know")) {
      setScore(s => ({ ...s, skipped: s.skipped + 1 }));
      let modelAnswer = "";
      try {
        const fb = await apiPost("/api/interview/feedback", {
          question: currentQ.text, answer: "I don't know this question, please show the model answer and explain it in detail.",
          job_role: jobRole, show_answer: true,
        });
        modelAnswer = fb.feedback || "";
      } catch {}
      if (!modelAnswer) modelAnswer = "💡 No worries! The key to this question is to structure your answer clearly. Research this topic and practice explaining it with examples from your own experience.";

      const nextIndex = qIndex + 1;
      const nextQ = questions[nextIndex];
      let content = `📖 **Model Answer for:** "${currentQ.text}"\n\n${modelAnswer}`;
      if (nextQ) {
        content += `\n\n---\n\n**Question ${nextIndex + 1} of ${questions.length}** · ${nextQ.category.toUpperCase()}\n\n${nextQ.text}`;
        setQIndex(nextIndex);
      } else {
        setIsDone(true);
        content += `\n\n---\n\n🎉 **Interview Complete!** You've answered all ${questions.length} questions.`;
      }
      addMsg({ role: "bot", type: "answer_reveal", content });
      setIsTyping(false);
      return;
    }

    // ── Normal answer + feedback ──────────────────────────────────────────────
    let feedback = "";
    try {
      const fb = await apiPost("/api/interview/feedback", {
        question: currentQ.text, answer: ans, job_role: jobRole, show_answer: false,
      });
      feedback = fb.feedback || "";
    } catch {}

    if (!feedback) {
      const wc = ans.split(/\s+/).length;
      feedback = wc < 10
        ? "💡 **Too brief** — elaborate with a specific example using STAR method."
        : wc > 200
          ? "✅ **Very detailed!** Keep this level of depth in your real interview."
          : "✅ **Good response!** Quantify your achievements where possible.";
    }

    const isGood = feedback.startsWith("✅");
    setScore(s => ({ ...s, good: s.good + (isGood ? 1 : 0), improve: s.improve + (isGood ? 0 : 1) }));

    const nextIndex = qIndex + 1;
    const nextQ = questions[nextIndex];
    let content = feedback;

    if (nextQ) {
      // Skip duplicate questions
      let ni = nextIndex;
      while (ni < questions.length && askedTexts.has(questions[ni].text.trim().toLowerCase())) ni++;
      const actualNext = questions[ni];
      if (actualNext) {
        content += `\n\n---\n\n**Question ${ni + 1} of ${questions.length}** · ${actualNext.category.toUpperCase()}\n\n${actualNext.text}`;
        setQIndex(ni);
        setAskedTexts(p => new Set([...p, actualNext.text.trim().toLowerCase()]));
      } else {
        setIsDone(true);
        content += `\n\n---\n\n🎉 **Interview Practice Complete!**\n\n✅ Strong: ${score.good + (isGood ? 1 : 0)} · 💡 Improve: ${score.improve + (isGood ? 0 : 1)} · ⏭ Skipped: ${score.skipped}\n\n**Tips:** Use STAR method · Quantify results · Research the company · Prepare 2-3 questions to ask.`;
      }
    } else {
      setIsDone(true);
      content += `\n\n---\n\n🎉 **Interview Practice Complete!**\n\n✅ Strong: ${score.good + (isGood ? 1 : 0)} · 💡 Improve: ${score.improve + (isGood ? 0 : 1)} · ⏭ Skipped: ${score.skipped}\n\n**Tips:** Use STAR method · Quantify results · Research the company · Prepare 2-3 questions to ask.`;
    }

    addMsg({ role: "bot", type: feedback.startsWith("✅") ? "feedback" : "feedback", content });
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Export chat ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const lines = [
      `CRAB AI — Interview Practice Session`,
      `Role: ${jobRole}${company ? ` at ${company}` : ""}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Score: ✅ ${score.good} Good · 💡 ${score.improve} Improve · ⏭ ${score.skipped} Skipped`,
      "═".repeat(60),
      "",
    ];
    messages.forEach(m => {
      lines.push(m.role === "user" ? `[YOU]\n${m.content}` : `[AI COACH]\n${m.content}`);
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `interview-${jobRole.replace(/\s+/g, "_")}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Chat exported as text file!");
  };

  const fmtContent = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line === "---") return <hr key={i} className="border-border/30 my-2" />;
      const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} />;
    });

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col" style={{ height: "calc(100vh - 110px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Interview Preparation</h1>
              <p className="text-xs text-muted-foreground">AI-powered mock interview with real-time feedback</p>
            </div>
          </div>
          {isStarted && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                Q{Math.min(qIndex + 1, questions.length)}/{questions.length}
              </span>
              <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">✅{score.good}</span>
              <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full">💡{score.improve}</span>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={messages.length === 0}>
                <Download className="w-3 h-3 mr-1" /> Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setIsStarted(false); setMessages([]); setQuestions([]); setQIndex(0); setIsDone(false); }}>
                <RotateCcw className="w-3 h-3 mr-1" /> New
              </Button>
            </div>
          )}
        </div>

        {!isStarted ? (
          /* ── Setup form ── */
          <div className="glass-card p-6 space-y-5 max-w-xl mx-auto w-full overflow-y-auto">
            <h2 className="font-semibold text-lg">Set Up Your Mock Interview</h2>

            <div>
              <Label className="font-medium text-sm">Upload Resume <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/40 transition-colors">
                <input type="file" id="iv-upload" accept=".pdf,.doc,.docx,.txt" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} className="hidden" />
                <label htmlFor="iv-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                  {file ? <span className="text-sm text-primary font-medium">{file.name}</span>
                        : <span className="text-sm text-muted-foreground">Click to upload</span>}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-medium text-sm">Target Job Role *</Label>
                <Input className="mt-1" placeholder="Data Analyst, SDE..." value={targetRole}
                  onChange={e => { setTargetRole(e.target.value); setIncludeCoding(isCodingRole(e.target.value) && !isNonTechRole(e.target.value)); }} />
              </div>
              <div>
                <Label className="font-medium text-sm">Company <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input className="mt-1" placeholder="Google, TCS..." value={company} onChange={e => setCompany(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-medium text-sm">Experience Level</Label>
                <div className="flex gap-1 mt-1">
                  {(["entry","mid","senior"] as const).map(l => (
                    <button key={l} onClick={() => setDifficulty(l)}
                      className={cn("flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-colors",
                        difficulty === l ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70")}>
                      {l === "entry" ? "🌱 Entry" : l === "mid" ? "🔥 Mid" : "⭐ Senior"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-medium text-sm">Questions per round</Label>
                <div className="flex gap-1 mt-1">
                  {[3,5,8,10].map(n => (
                    <button key={n} onClick={() => setQPerRound(n)}
                      className={cn("flex-1 py-1.5 rounded-md text-xs font-medium transition-colors",
                        qPerRound === n ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70")}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {targetRole && isCodingRole(targetRole) && !isNonTechRole(targetRole) && (
              <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Code className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Include Coding / DSA Questions?</p>
                  <p className="text-xs text-muted-foreground">Recommended for {targetRole} roles</p>
                </div>
                <button onClick={() => setIncludeCoding(p => !p)}
                  className={cn("w-10 h-5 rounded-full transition-colors relative",
                    includeCoding ? "bg-orange-500" : "bg-muted")}>
                  <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow",
                    includeCoding ? "left-5" : "left-0.5")} />
                </button>
              </div>
            )}

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
              <p>💡 <strong>During the interview:</strong></p>
              <p>• Type <strong>"skip"</strong> or <strong>"show answer"</strong> to see the model answer</p>
              <p>• Type <strong>"switch to hr"</strong> / <strong>"switch to coding"</strong> to change rounds</p>
            </div>

            <Button className="w-full" size="lg" onClick={handleStart} disabled={!targetRole || isLoading}>
              {isLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating Questions...</span>
                         : "🎯 Start Interview Practice"}
            </Button>
          </div>

        ) : (
          /* ── Chat interface ── */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Question overview */}
            {questions.length > 0 && (
              <button onClick={() => setShowAll(p => !p)}
                className="flex items-center gap-1 text-xs text-muted-foreground mb-2 hover:text-foreground">
                <ChevronDown className={cn("w-3 h-3 transition-transform", showAll && "rotate-180")} />
                {showAll ? "Hide" : "Show"} all {questions.length} questions
              </button>
            )}
            {showAll && (
              <div className="glass-card p-3 mb-3 max-h-44 overflow-y-auto">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1 border-b border-border/30 last:border-0">
                    <span className={cn("px-1.5 py-0.5 rounded text-xs flex-shrink-0", CAT_COLOR[q.category])}>{q.category}</span>
                    <span className={cn("text-muted-foreground", i === qIndex && "text-foreground font-medium", i < qIndex && "line-through opacity-40")}>
                      {i+1}. {q.text.slice(0, 90)}{q.text.length > 90 ? "…" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-1">
              {messages.map(m => (
                <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    m.role === "bot" ? "bg-primary/10" : "bg-muted")}>
                    {m.role === "bot"
                      ? m.type === "coding" ? <Code className="w-4 h-4 text-orange-500" /> : <Bot className="w-4 h-4 text-primary" />
                      : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn("max-w-[84%] rounded-2xl px-4 py-3 text-sm",
                    m.role === "bot"
                      ? m.type === "complete" ? "bg-green-500/10 border border-green-500/20 rounded-tl-sm"
                        : m.type === "question" || m.type === "switch" ? "bg-primary/5 border border-primary/20 rounded-tl-sm"
                        : m.type === "answer_reveal" ? "bg-orange-500/5 border border-orange-500/20 rounded-tl-sm"
                        : "bg-muted rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm")}>
                    {fmtContent(m.content)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                      <span className="text-xs text-muted-foreground ml-2">Evaluating your answer…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            {!isDone ? (
              <div className="glass-card p-3 flex-shrink-0">
                <Textarea
                  placeholder={questions[qIndex]?.category === "coding"
                    ? "Write your code or explain your approach here... (Enter to submit, Shift+Enter for new line)"
                    : "Type your answer... (Enter to submit · type 'skip' to see the model answer · 'switch to hr' to change round)"}
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn("min-h-[80px] max-h-[160px] resize-none mb-2 text-sm",
                    questions[qIndex]?.category === "coding" && "font-mono")}
                  disabled={isTyping}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {input.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      onClick={() => { setInput("skip"); }}>
                      <BookOpen className="w-3 h-3" /> Show answer
                    </button>
                  </div>
                  <Button size="sm" onClick={handleSend} disabled={!input.trim() || isTyping}>
                    <Send className="w-4 h-4 mr-1.5" /> Submit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-4 text-center flex-shrink-0">
                <p className="text-sm text-muted-foreground mb-3">Interview session complete!</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-1" />Export Chat</Button>
                  <Button onClick={() => { setIsStarted(false); setMessages([]); setQuestions([]); setQIndex(0); setIsDone(false); }}>
                    <RotateCcw className="w-4 h-4 mr-2" /> New Session
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
