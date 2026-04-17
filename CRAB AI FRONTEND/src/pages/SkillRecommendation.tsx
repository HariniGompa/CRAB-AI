import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Lightbulb, BookOpen, ExternalLink, Star, Target, Clock } from "lucide-react";
import { toast } from "sonner";

interface SkillGap {
  skill: string;
  priority: "high" | "medium" | "low";
}

interface Course {
  title: string;
  platform: string;
  provider: string;
  duration?: string;
  level?: string;
  price?: string;
  rating?: number;
  url?: string;
  reason?: string;
  matching_skills?: string[];
  platform_meta?: { icon: string; color: string };
}

interface SkillGapAnalysis {
  career_goal: string;
  skill_gaps: string[];
  priority_skills: string[];
  career_path_tip: string;
  estimated_timeline: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  Coursera: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Udemy: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  YouTube: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  Kaggle: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  freeCodeCamp: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  edX: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  "LinkedIn Learning": "bg-blue-700/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
  Educative: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
};

const PLATFORM_ICONS: Record<string, string> = {
  Coursera: "🎓",
  Udemy: "🎯",
  YouTube: "▶️",
  Kaggle: "📊",
  freeCodeCamp: "🔥",
  edX: "🏛️",
  "LinkedIn Learning": "💼",
  Educative: "📚",
};

const getPlatformStyle = (platform: string) =>
  PLATFORM_COLORS[platform] || "bg-muted text-muted-foreground border-border";

const getPlatformIcon = (platform: string) =>
  PLATFORM_ICONS[platform] || "📖";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const SkillRecommendationPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [careerGoal, setCareerGoal] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"skills" | "courses">("courses");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!careerGoal.trim()) { toast.error("Please enter your career goal or target role"); return; }
    setIsAnalyzing(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Parse current skills as comma-separated list
      const currentSkillsList = currentSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Read resume text if file uploaded
      let resumeText = "";
      if (file) {
        try {
          resumeText = await file.text();
        } catch {
          // ignore read errors
        }
      }

      const res = await fetch(`${API_BASE}/api/courses/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          current_skills: currentSkillsList,
          // target_skills is a required field — send parsed current skills or empty
          target_skills: currentSkillsList,
          // career_goal drives the AI analysis
          career_goal: careerGoal,
          resume_text: resumeText,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      // Skill gap analysis from AI
      const gapAnalysis: SkillGapAnalysis = data.skill_gap_analysis ?? {};
      setAnalysis(gapAnalysis);

      const gaps: string[] = gapAnalysis.skill_gaps ?? data.recommended_skills ?? [];
      const prioritySet = new Set<string>((gapAnalysis.priority_skills ?? []).map((s: string) => s.toLowerCase()));

      setSkillGaps(
        gaps.slice(0, 10).map((skill: string) => ({
          skill,
          priority: prioritySet.has(skill.toLowerCase())
            ? "high"
            : gaps.indexOf(skill) < 5
            ? "medium"
            : "low",
        }))
      );

      const rawCourses: Course[] = data.courses ?? [];
      setCourses(rawCourses);
      setActiveTab(rawCourses.length > 0 ? "courses" : "skills");
    } catch (err: any) {
      toast.error(err.message || "Failed to get recommendations");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const priorityColor = (p: string) =>
    ({
      high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200",
      medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200",
      low: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200",
    }[p] || "bg-muted text-muted-foreground");

  const hasResults = skillGaps.length > 0 || courses.length > 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Course & Skill Recommendation</h1>
            <p className="text-muted-foreground text-sm">
              AI-powered skill gap analysis + courses from Coursera, Udemy, YouTube, Kaggle & more
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input panel — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-5">
              <h2 className="font-medium mb-3">
                Upload Resume{" "}
                <span className="text-muted-foreground font-normal text-sm">(optional — improves accuracy)</span>
              </h2>
              <div className="border border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume-upload" className="cursor-pointer block">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium truncate max-w-[180px]">{file.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click to upload resume</p>
                  )}
                </label>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <div>
                <Label className="font-medium">Career Goal / Target Role *</Label>
                <Input
                  placeholder="e.g., Data Scientist, Full Stack Developer, DevOps Engineer"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Describe your goal — AI will identify the skills you need
                </p>
              </div>

              <div>
                <Label className="font-medium">
                  Current Skills{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  placeholder="e.g., Python, HTML, CSS, Excel (comma-separated)"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  className="mt-1 resize-none min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate skills with commas
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleAnalyze}
                disabled={!careerGoal.trim() || isAnalyzing}
              >
                {isAnalyzing ? "Analyzing with AI..." : "Analyze & Get Recommendations"}
              </Button>
            </div>
          </div>

          {/* Results — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            {hasResults ? (
              <>
                {/* AI Analysis Summary */}
                {analysis && (analysis.career_path_tip || analysis.estimated_timeline) && (
                  <div className="glass-card p-5 border border-primary/20">
                    <h2 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      AI Career Analysis
                    </h2>
                    <div className="space-y-2">
                      {analysis.career_path_tip && (
                        <p className="text-sm text-muted-foreground">
                          💡 {analysis.career_path_tip}
                        </p>
                      )}
                      {analysis.estimated_timeline && (
                        <p className="text-sm flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          Estimated timeline: <span className="font-medium text-foreground">{analysis.estimated_timeline}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("courses")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "courses"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-1.5" />
                    Courses ({courses.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("skills")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "skills"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 inline mr-1.5" />
                    Skill Gaps ({skillGaps.length})
                  </button>
                </div>

                {/* Skills tab */}
                {activeTab === "skills" && skillGaps.length > 0 && (
                  <div className="glass-card p-5">
                    <h2 className="font-medium mb-4">Skills You Need to Learn</h2>
                    <div className="space-y-2">
                      {skillGaps.map(({ skill, priority }) => (
                        <div
                          key={skill}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <span className="text-sm font-medium">{skill}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor(priority)}`}>
                            {priority} priority
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses tab */}
                {activeTab === "courses" && (
                  <div className="space-y-3">
                    {courses.length === 0 ? (
                      <div className="glass-card p-8 text-center">
                        <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                        <p className="font-medium mb-1">No courses found</p>
                        <p className="text-sm text-muted-foreground">
                          Try a more specific career goal like "React Developer" or "Data Analyst"
                        </p>
                      </div>
                    ) : (
                      courses.map((course, idx) => (
                        <div key={idx} className="glass-card p-5">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm leading-snug">{course.title}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{course.provider}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-md border font-medium flex-shrink-0 ${getPlatformStyle(course.platform)}`}>
                              {getPlatformIcon(course.platform)} {course.platform}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                            {course.duration && <span>⏱ {course.duration}</span>}
                            {course.level && <span>📊 {course.level}</span>}
                            {course.price && <span>💰 {course.price}</span>}
                            {course.rating && (
                              <span className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {course.rating}
                              </span>
                            )}
                          </div>

                          {course.reason && (
                            <p className="text-xs text-muted-foreground mb-3 italic border-l-2 border-primary/30 pl-2">
                              {course.reason}
                            </p>
                          )}

                          {course.matching_skills && course.matching_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {course.matching_skills.slice(0, 5).map((skill) => (
                                <span
                                  key={skill}
                                  className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          {course.url && (
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                            >
                              View Course <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="font-medium mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Enter your career goal and click Analyze. AI will identify your skill gaps and recommend the best courses.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SkillRecommendationPage;
