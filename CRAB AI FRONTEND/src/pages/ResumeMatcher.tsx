import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, FileSearch, TrendingUp, Lightbulb, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const ResumeMatcher = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    matchPercentage: number;
    matchedSkills: string[];
    recommendedSkills: string[];
    improvements: string[];
    summary: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) { toast.error("Please upload a resume first"); return; }
    if (!targetRole) { toast.error("Please enter a target job role"); return; }
    setIsAnalyzing(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Send file directly — backend extracts text properly using PyPDF2
      const formData = new FormData();
      formData.append("file", file);
      formData.append("target_role", targetRole);
      if (jobDescription.trim()) {
        formData.append("job_description", jobDescription.trim());
      }

      const res = await fetch(`${API_BASE}/api/resume-matcher/analyze-text`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      setResult({
        matchPercentage: Math.round(data.match_percentage ?? 0),
        matchedSkills: data.matched_skills ?? [],
        recommendedSkills: data.missing_skills ?? [],
        improvements: data.improvements ?? [],
        summary: data.summary ?? "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to match resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchLabel = (pct: number) => {
    if (pct >= 75) return { text: "Strong Match 🎉", color: "text-green-600 dark:text-green-400" };
    if (pct >= 50) return { text: "Good Match 👍", color: "text-amber-600 dark:text-amber-400" };
    return { text: "Needs Improvement 💪", color: "text-red-600 dark:text-red-400" };
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileSearch className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Resume Matcher</h1>
            <p className="text-muted-foreground text-sm">AI-powered resume vs job description analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="font-medium mb-3">Upload Resume</h2>
              <div className="border border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input type="file" id="resume-upload" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} className="hidden" />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium text-sm">{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-sm mb-1">Click to upload</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, or TXT (max 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <div>
                <Label className="font-medium">Target Job Role *</Label>
                <Input
                  placeholder="e.g., Senior Data Analyst"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="mt-1 h-11"
                />
              </div>
              <div>
                <Label className="font-medium">
                  Job Description{" "}
                  <span className="text-muted-foreground font-normal">(optional but improves accuracy)</span>
                </Label>
                <Textarea
                  placeholder="Paste the full job description here for a more accurate match..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="mt-1 min-h-[120px] resize-none"
                />
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleAnalyze} disabled={!file || !targetRole || isAnalyzing}>
              {isAnalyzing ? "Analyzing with AI..." : "Match Resume"}
            </Button>
          </div>

          {/* Output */}
          <div className="space-y-4">
            {result ? (
              <>
                <div className="glass-card p-5">
                  <h2 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Match Result
                  </h2>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-primary">{result.matchPercentage}%</span>
                      <span className={`text-sm font-medium ${getMatchLabel(result.matchPercentage).color}`}>
                        {getMatchLabel(result.matchPercentage).text}
                      </span>
                    </div>
                    <Progress value={result.matchPercentage} className="h-3" />
                  </div>
                  {result.summary && (
                    <p className="text-sm text-muted-foreground mt-2 italic">{result.summary}</p>
                  )}
                </div>

                {result.matchedSkills.length > 0 && (
                  <div className="glass-card p-5">
                    <h2 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Matched Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md text-sm border border-green-200 dark:border-green-800">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.recommendedSkills.length > 0 && (
                  <div className="glass-card p-5">
                    <h2 className="font-medium mb-3">Skills to Add</h2>
                    <div className="flex flex-wrap gap-2">
                      {result.recommendedSkills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-sm">
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="glass-card p-5">
                  <h2 className="font-medium mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Improvement Suggestions
                  </h2>
                  <ul className="space-y-2">
                    {result.improvements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="glass-card p-10 text-center">
                <FileSearch className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <h3 className="font-medium mb-1">No Results Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Upload your resume and enter a target role to see AI-powered matching results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeMatcher;
