import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Target, CheckCircle, AlertCircle, Lightbulb, Zap, BookOpen, Type, Layout, AlignLeft } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const ATSScoring = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error("Please upload a resume first"); return; }
    setIsAnalyzing(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const auth = token ? { Authorization: `Bearer ${token}` } : {};

      let data: any;
      const fname = file.name.toLowerCase();

      if (fname.endsWith(".pdf") || fname.endsWith(".docx")) {
        const fd = new FormData();
        fd.append("file", file);
        if (jobDescription.trim()) fd.append("job_description", jobDescription.trim());
        const res = await fetch(`${API_BASE}/api/ats/analyze-file`, {
          method: "POST", headers: { ...auth }, body: fd,
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Error ${res.status}`); }
        data = await res.json();
      } else {
        const text = await file.text();
        if (!text.trim()) throw new Error("File appears empty");
        const res = await fetch(`${API_BASE}/api/ats/analyze-text`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ resume_text: text, job_description: jobDescription || undefined }),
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Error ${res.status}`); }
        data = await res.json();
      }
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze resume");
    } finally { setIsAnalyzing(false); }
  };

  const score = result?.overall_score ?? result?.score ?? 0;
  const scoreColor = (s: number) => s >= 70 ? "text-green-600 dark:text-green-400" : s >= 45 ? "text-amber-500" : "text-red-500";
  const scoreLabel = (s: number) => s >= 70 ? "Strong ATS Match ✅" : s >= 45 ? "Moderate Match ⚠️" : "Needs Improvement ❌";
  const scoreBg    = (s: number) => s >= 70 ? "from-green-500/10 to-transparent" : s >= 45 ? "from-amber-500/10 to-transparent" : "from-red-500/10 to-transparent";

  const struct = result?.structure_feedback;
  const grammar = result?.grammar_feedback;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ATS Scoring</h1>
            <p className="text-muted-foreground text-sm">Comprehensive AI-powered resume evaluation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="font-semibold mb-3">Upload Resume</h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <input type="file" id="ats-upload" accept=".pdf,.txt,.doc,.docx" onChange={handleFileChange} className="hidden" />
                <label htmlFor="ats-upload" className="cursor-pointer block">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <FileText className="w-5 h-5" />{file.name}
                    </div>
                  ) : (
                    <>
                      <p className="font-medium mb-1">Click to upload</p>
                      <p className="text-xs text-muted-foreground">PDF, TXT, or DOCX</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="glass-card p-5">
              <Label className="font-semibold">Job Description <span className="font-normal text-muted-foreground text-sm">(recommended)</span></Label>
              <Textarea className="mt-2 min-h-[160px] resize-none" placeholder="Paste the job description here for the most accurate analysis..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
            </div>

            <Button size="lg" className="w-full" onClick={handleAnalyze} disabled={!file || isAnalyzing}>
              {isAnalyzing
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</span>
                : "🎯 Analyze Resume"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Evaluates skills, structure, grammar, formatting, keywords & more</p>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Score */}
                <div className={`glass-card p-6 bg-gradient-to-br ${scoreBg(score)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Overall ATS Score</h2>
                    {result.ai_powered && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1"><Zap className="w-3 h-3"/>AI</span>}
                  </div>
                  <div className="flex items-end gap-4 mb-3">
                    <div className={`text-5xl font-bold ${scoreColor(score)}`}>{Math.round(score)}%</div>
                    {result.ats_score && result.ats_score !== score && (
                      <div className="text-sm text-muted-foreground pb-2">ATS Format: <span className="font-semibold">{result.ats_score}%</span></div>
                    )}
                  </div>
                  <p className={`text-sm font-medium mb-3 ${scoreColor(score)}`}>{scoreLabel(score)}</p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${score}%`, background: score >= 70 ? "#16a34a" : score >= 45 ? "#f59e0b" : "#dc2626" }} />
                  </div>
                  {result.summary && <p className="text-xs text-muted-foreground mt-3 italic">{result.summary}</p>}
                  {result.keyword_alignment && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Keyword alignment:</span>
                      <span className={`font-semibold ${result.keyword_alignment === "high" ? "text-green-500" : result.keyword_alignment === "medium" ? "text-amber-500" : "text-red-500"}`}>
                        {result.keyword_alignment?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Matched skills */}
                {result.matched_skills?.length > 0 && (
                  <div className="glass-card p-5">
                    <h2 className="font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/>Matched Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_skills.map((s: string) => (
                        <span key={s} className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm border border-green-200 dark:border-green-800">✓ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing skills */}
                {result.missing_keywords?.length > 0 && (
                  <div className="glass-card p-5">
                    <h2 className="font-semibold mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500"/>Missing Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((s: string) => (
                        <span key={s} className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-sm border border-amber-200 dark:border-amber-800">+ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structure feedback */}
                {struct && (
                  <div className="glass-card p-5">
                    <h2 className="font-semibold mb-3 flex items-center gap-2"><Layout className="w-4 h-4 text-blue-500"/>Structure & Formatting</h2>
                    <div className="space-y-2 text-sm">
                      {struct.missing_sections?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✗</span>
                          <span className="text-muted-foreground">Missing sections: <strong className="text-foreground">{struct.missing_sections.join(", ")}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={struct.has_quantified_achievements ? "text-green-500" : "text-amber-500"}>{struct.has_quantified_achievements ? "✓" : "!"}</span>
                        <span className="text-muted-foreground">{struct.has_quantified_achievements ? "Has quantified achievements" : "Add numbers/percentages to achievements"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={struct.action_verb_usage === "good" ? "text-green-500" : "text-amber-500"}>
                          {struct.action_verb_usage === "good" ? "✓" : "!"}
                        </span>
                        <span className="text-muted-foreground">Action verb usage: <strong className="text-foreground capitalize">{struct.action_verb_usage}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={struct.formatting_quality === "good" ? "text-green-500" : "text-amber-500"}>
                          {struct.formatting_quality === "good" ? "✓" : "!"}
                        </span>
                        <span className="text-muted-foreground">Formatting quality: <strong className="text-foreground capitalize">{struct.formatting_quality}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grammar feedback */}
                {grammar && (
                  <div className="glass-card p-5">
                    <h2 className="font-semibold mb-3 flex items-center gap-2"><Type className="w-4 h-4 text-purple-500"/>Grammar & Language</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={grammar.overall === "good" ? "text-green-500" : "text-amber-500"}>
                          {grammar.overall === "good" ? "✓" : "!"}
                        </span>
                        <span className="text-muted-foreground">Overall quality: <strong className="text-foreground capitalize">{grammar.overall}</strong></span>
                      </div>
                      {grammar.issues_found?.length > 0 && grammar.issues_found[0] !== "none" && (
                        <ul className="space-y-1 mt-1">
                          {grammar.issues_found.map((issue: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>{issue}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {result.strengths?.length > 0 && (
                  <div className="glass-card p-5">
                    <h2 className="font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/>Strengths</h2>
                    <ul className="space-y-1">
                      {result.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.suggestions?.length > 0 && (
                  <div className="glass-card p-5">
                    <h2 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary"/>Recommendations</h2>
                    <ul className="space-y-2">
                      {result.suggestions.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                <h3 className="font-semibold mb-2">No Results Yet</h3>
                <p className="text-sm text-muted-foreground">Upload your resume and paste a job description for a complete AI evaluation covering skills, structure, grammar, formatting and more.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ATSScoring;
