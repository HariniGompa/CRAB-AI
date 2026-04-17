import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileEdit, Plus, Trash2, Download, Eye, Check, ArrowLeft, ArrowRight,
  Briefcase, GraduationCap, Loader2, Save, Globe, Award, BadgeCheck,
  Building2, Edit,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useResumes } from "@/hooks/useResumes";
import ProfessionalTemplate from "@/templates/resume/Professional";
import MinimalTemplate from "@/templates/resume/Minimal";
import ModernTemplate from "@/templates/resume/Modern";
import CreativeTemplate from "@/templates/resume/Creative";

// ── IMPORTANT: FieldCard defined OUTSIDE component to prevent remount on every keystroke
const FieldCard = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) => (
  <div className="glass-card p-5">
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-4 h-4 text-primary" />}
      <h2 className="font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);

const TEMPLATES = [
  { id: "professional", name: "Professional", description: "Navy blue, ATS-optimized, corporate", color: "#1a365d" },
  { id: "minimal",      name: "Minimal",      description: "Clean white, typography-focused",    color: "#333333" },
  { id: "modern",       name: "Modern",       description: "Dark sidebar, indigo accents",       color: "#6366f1" },
  { id: "creative",     name: "Creative",     description: "Teal gradient, two-column layout",   color: "#0d9488" },
];

type Step     = "user-type" | "template" | "form";
type UserType = "fresher" | "experienced" | null;

const makeId  = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);
const blank   = <T extends object>(obj: T): T & { id: string } => ({ id: makeId(), ...obj });

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { canCreateResume, createResume, resumeCount, maxResumes } = useResumes();

  const [step,             setStep]            = useState<Step>("user-type");
  const [userType,         setUserType]        = useState<UserType>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview,      setShowPreview]     = useState(false);
  const [isSaving,         setIsSaving]        = useState(false);
  const [isExporting,      setIsExporting]     = useState(false);
  const [resumeName,       setResumeName]      = useState("My Resume");
  const resumeRef = useRef<HTMLDivElement>(null);

  // ── Personal info ───────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [summary,  setSummary]  = useState("");
  const [skills,   setSkills]   = useState("");

  // ── Arrays ──────────────────────────────────────────────────────────────────
  const [experiences,    setExperiences]    = useState([blank({ title: "", company: "", duration: "", description: "" })]);
  const [education,      setEducation]      = useState([blank({ degree: "", institution: "", year: "", cgpa: "" })]);
  const [projects,       setProjects]       = useState([blank({ name: "", description: "", technologies: "", githubLink: "" })]);
  const [profileLinks,   setProfileLinks]   = useState([blank({ platform: "", url: "" })]);
  const [achievements,   setAchievements]   = useState([blank({ title: "", description: "" })]);
  const [certifications, setCertifications] = useState([blank({ name: "", issuer: "", date: "" })]);
  const [internships,    setInternships]    = useState([blank({ title: "", company: "", duration: "", description: "" })]);

  // ── Generic array helpers (stable references via useCallback) ───────────────
  const addItem = useCallback(<T extends object>(setter: React.Dispatch<React.SetStateAction<any[]>>, tmpl: T) =>
    setter(prev => [...prev, blank(tmpl)]), []);

  const removeItem = useCallback((setter: React.Dispatch<React.SetStateAction<any[]>>, id: string) =>
    setter(prev => prev.length > 1 ? prev.filter((x: any) => x.id !== id) : prev), []);

  const updateField = useCallback((setter: React.Dispatch<React.SetStateAction<any[]>>, id: string, field: string, value: string) =>
    setter(prev => prev.map((x: any) => x.id === id ? { ...x, [field]: value } : x)), []);

  // ── Template props ──────────────────────────────────────────────────────────
  const templateProps = {
    formData: { fullName, email, phone, summary, skills },
    experiences, education, projects, profileLinks, achievements, certifications, internships, userType,
  };

  // ── Export PDF ──────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!showPreview) { setShowPreview(true); toast("Switched to Preview — click Download PDF again"); return; }
    if (!resumeRef.current) { toast.error("Preview not ready"); return; }
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf    = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(w / canvas.width, h / canvas.height);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", (w - canvas.width * ratio) / 2, 8, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`${fullName || "Resume"}.pdf`);
      toast.success("Resume downloaded!");
    } catch { toast.error("Export failed — try again"); }
    finally { setIsExporting(false); }
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    setIsSaving(true);
    try {
      await createResume({
        name: resumeName, user_type: userType as any,
        template: selectedTemplate || "professional",
        form_data: { fullName, email, phone, summary, skills },
        experiences, education, projects,
        profile_links: profileLinks, achievements, certifications, internships,
      });
    } finally { setIsSaving(false); }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 1 — User type
  // ══════════════════════════════════════════════════════════════════════════════
  if (step === "user-type") return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileEdit className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Resume Builder</h1>
            <p className="text-sm text-muted-foreground">Create a professional ATS-optimized resume</p>
          </div>
        </div>
        {user && (
          <div className="glass-card p-4 mb-6">
            <p className="text-sm text-muted-foreground">Resumes saved: <span className="font-bold text-foreground">{resumeCount}/{maxResumes}</span></p>
          </div>
        )}
        <div className="glass-card p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">What describes you best?</h2>
          <p className="text-muted-foreground text-sm mb-8">This customizes your resume sections</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { type: "fresher",     Icon: GraduationCap, title: "Fresher / Student",        desc: "New graduate with projects and internships" },
              { type: "experienced", Icon: Briefcase,      title: "Experienced Professional", desc: "Have relevant work experience to showcase" },
            ].map(({ type, Icon, title, desc }) => (
              <button key={type}
                onClick={() => { setUserType(type as UserType); setStep("template"); }}
                className="p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 2 — Template selection
  // ══════════════════════════════════════════════════════════════════════════════
  if (step === "template") return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setStep("user-type")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold mb-1">Choose a Template</h1>
        <p className="text-sm text-muted-foreground mb-6">All templates are ATS-friendly and professionally designed</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
              <div className="aspect-[3/4] rounded-lg mb-3 flex items-center justify-center text-white text-3xl font-bold"
                style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                {t.name[0]}
              </div>
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </div>
                {selectedTemplate === t.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => selectedTemplate && setStep("form")} disabled={!selectedTemplate}>
            Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // STEP 3 — Form + Preview
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep("template")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold">{TEMPLATES.find(t => t.id === selectedTemplate)?.name} Resume</h1>
            <span className="text-xs bg-muted px-2 py-1 rounded-full capitalize">{userType}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(p => !p)}>
              {showPreview ? <><Edit className="w-3 h-3 mr-1" />Edit</> : <><Eye className="w-3 h-3 mr-1" />Preview</>}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving || !user}>
              {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />} Save
            </Button>
            <Button size="sm" onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Download className="w-3 h-3 mr-1" />} Download PDF
            </Button>
          </div>
        </div>

        {/* ── Preview ──────────────────────────────────────────────────────── */}
        {showPreview ? (
          <div ref={resumeRef} className="bg-white text-black shadow-xl rounded-lg overflow-hidden max-w-3xl mx-auto">
            {selectedTemplate === "professional" && <ProfessionalTemplate {...templateProps} />}
            {selectedTemplate === "minimal"      && <MinimalTemplate      {...templateProps} />}
            {selectedTemplate === "modern"       && <ModernTemplate       {...templateProps} />}
            {selectedTemplate === "creative"     && <CreativeTemplate     {...templateProps} />}
          </div>

        /* ── Edit form ─────────────────────────────────────────────────────── */
        ) : (
          <div className="space-y-4">

            {/* Resume name */}
            <FieldCard title="Resume Name">
              <Input value={resumeName} onChange={e => setResumeName(e.target.value)} placeholder="My Resume" />
            </FieldCard>

            {/* Personal info */}
            <FieldCard title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input className="mt-1" placeholder="Monisha Mudduluru" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input className="mt-1" type="email" placeholder="monisha@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input className="mt-1" placeholder="+91 9999999999" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
            </FieldCard>

            {/* Profile Links */}
            <FieldCard title="Profile Links" icon={Globe}>
              <div className="space-y-2">
                {profileLinks.map(l => (
                  <div key={l.id} className="grid grid-cols-5 gap-2 items-center">
                    <Input className="col-span-2" placeholder="GitHub" value={l.platform}
                      onChange={e => updateField(setProfileLinks, l.id, "platform", e.target.value)} />
                    <Input className="col-span-2" placeholder="https://github.com/..." value={l.url}
                      onChange={e => updateField(setProfileLinks, l.id, "url", e.target.value)} />
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(setProfileLinks, l.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addItem(setProfileLinks, { platform: "", url: "" })}>
                  <Plus className="w-3 h-3 mr-1" /> Add Link
                </Button>
              </div>
            </FieldCard>

            {/* Summary */}
            <FieldCard title="Professional Summary">
              <Textarea placeholder="AI & DS student with hands-on experience in real-world projects..."
                value={summary} onChange={e => setSummary(e.target.value)} className="min-h-[80px] resize-none" />
            </FieldCard>

            {/* Skills */}
            <FieldCard title="Skills">
              <Input placeholder="Python, SQL, Machine Learning, TensorFlow, Pandas (comma separated)"
                value={skills} onChange={e => setSkills(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Separate each skill with a comma for best ATS results</p>
            </FieldCard>

            {/* Work Experience — experienced only */}
            {userType === "experienced" && (
              <FieldCard title="Work Experience" icon={Briefcase}>
                <div className="space-y-4">
                  {experiences.map(exp => (
                    <div key={exp.id} className="p-4 bg-muted/40 rounded-lg relative">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 hover:text-destructive"
                        onClick={() => removeItem(setExperiences, exp.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <Label className="text-xs">Job Title</Label>
                          <Input className="mt-1" placeholder="Software Engineer" value={exp.title}
                            onChange={e => updateField(setExperiences, exp.id, "title", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Company</Label>
                          <Input className="mt-1" placeholder="Tech Corp" value={exp.company}
                            onChange={e => updateField(setExperiences, exp.id, "company", e.target.value)} />
                        </div>
                      </div>
                      <div className="mb-2">
                        <Label className="text-xs">Duration</Label>
                        <Input className="mt-1" placeholder="Jan 2022 - Present" value={exp.duration}
                          onChange={e => updateField(setExperiences, exp.id, "duration", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Key Responsibilities & Achievements</Label>
                        <Textarea className="mt-1 min-h-[60px] resize-none" placeholder="Led development of..."
                          value={exp.description}
                          onChange={e => updateField(setExperiences, exp.id, "description", e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm"
                    onClick={() => addItem(setExperiences, { title: "", company: "", duration: "", description: "" })}>
                    <Plus className="w-3 h-3 mr-1" /> Add Experience
                  </Button>
                </div>
              </FieldCard>
            )}

            {/* Internships */}
            <FieldCard title="Internships" icon={Building2}>
              <div className="space-y-4">
                {internships.map(i => (
                  <div key={i.id} className="p-4 bg-muted/40 rounded-lg relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 hover:text-destructive"
                      onClick={() => removeItem(setInternships, i.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input className="mt-1" placeholder="AI Intern" value={i.title}
                          onChange={e => updateField(setInternships, i.id, "title", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Organization</Label>
                        <Input className="mt-1" placeholder="Edunet Foundation" value={i.company}
                          onChange={e => updateField(setInternships, i.id, "company", e.target.value)} />
                      </div>
                    </div>
                    <div className="mb-2">
                      <Label className="text-xs">Duration</Label>
                      <Input className="mt-1" placeholder="Jun 2024 - Aug 2024" value={i.duration}
                        onChange={e => updateField(setInternships, i.id, "duration", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">What you worked on</Label>
                      <Textarea className="mt-1 min-h-[60px] resize-none" placeholder="Developed ML model for..."
                        value={i.description}
                        onChange={e => updateField(setInternships, i.id, "description", e.target.value)} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm"
                  onClick={() => addItem(setInternships, { title: "", company: "", duration: "", description: "" })}>
                  <Plus className="w-3 h-3 mr-1" /> Add Internship
                </Button>
              </div>
            </FieldCard>

            {/* Projects */}
            <FieldCard title="Projects">
              <div className="space-y-4">
                {projects.map(p => (
                  <div key={p.id} className="p-4 bg-muted/40 rounded-lg relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 hover:text-destructive"
                      onClick={() => removeItem(setProjects, p.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <Label className="text-xs">Project Name</Label>
                        <Input className="mt-1" placeholder="Ransomware Detection System" value={p.name}
                          onChange={e => updateField(setProjects, p.id, "name", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Technologies</Label>
                        <Input className="mt-1" placeholder="Python, TensorFlow, Scikit-learn" value={p.technologies}
                          onChange={e => updateField(setProjects, p.id, "technologies", e.target.value)} />
                      </div>
                    </div>
                    <div className="mb-2">
                      <Label className="text-xs">Description</Label>
                      <Textarea className="mt-1 min-h-[60px] resize-none" placeholder="Developed a desktop application..."
                        value={p.description}
                        onChange={e => updateField(setProjects, p.id, "description", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">GitHub Link (optional)</Label>
                      <Input className="mt-1" placeholder="https://github.com/..." value={p.githubLink || ""}
                        onChange={e => updateField(setProjects, p.id, "githubLink", e.target.value)} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm"
                  onClick={() => addItem(setProjects, { name: "", description: "", technologies: "", githubLink: "" })}>
                  <Plus className="w-3 h-3 mr-1" /> Add Project
                </Button>
              </div>
            </FieldCard>

            {/* Education */}
            <FieldCard title="Education" icon={GraduationCap}>
              <div className="space-y-3">
                {education.map(e => (
                  <div key={e.id} className="p-4 bg-muted/40 rounded-lg relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 hover:text-destructive"
                      onClick={() => removeItem(setEducation, e.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <Label className="text-xs">Degree / Program</Label>
                        <Input className="mt-1" placeholder="B.Tech AI & Data Science" value={e.degree}
                          onChange={ev => updateField(setEducation, e.id, "degree", ev.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Institution</Label>
                        <Input className="mt-1" placeholder="Malla Reddy College of Engineering" value={e.institution}
                          onChange={ev => updateField(setEducation, e.id, "institution", ev.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Year</Label>
                        <Input className="mt-1" placeholder="2022 - 2026" value={e.year}
                          onChange={ev => updateField(setEducation, e.id, "year", ev.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">CGPA / Percentage</Label>
                        <Input className="mt-1" placeholder="7.97 / 10" value={e.cgpa || ""}
                          onChange={ev => updateField(setEducation, e.id, "cgpa", ev.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm"
                  onClick={() => addItem(setEducation, { degree: "", institution: "", year: "", cgpa: "" })}>
                  <Plus className="w-3 h-3 mr-1" /> Add Education
                </Button>
              </div>
            </FieldCard>

            {/* Certifications */}
            <FieldCard title="Certifications" icon={BadgeCheck}>
              <div className="space-y-2">
                {certifications.map(c => (
                  <div key={c.id} className="grid grid-cols-7 gap-2 items-center">
                    <Input className="col-span-3" placeholder="Python for Data Science" value={c.name}
                      onChange={e => updateField(setCertifications, c.id, "name", e.target.value)} />
                    <Input className="col-span-2" placeholder="Infosys Springboard" value={c.issuer}
                      onChange={e => updateField(setCertifications, c.id, "issuer", e.target.value)} />
                    <Input className="col-span-1" placeholder="2024" value={c.date}
                      onChange={e => updateField(setCertifications, c.id, "date", e.target.value)} />
                    <Button variant="ghost" size="icon" className="hover:text-destructive"
                      onClick={() => removeItem(setCertifications, c.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm"
                  onClick={() => addItem(setCertifications, { name: "", issuer: "", date: "" })}>
                  <Plus className="w-3 h-3 mr-1" /> Add Certification
                </Button>
              </div>
            </FieldCard>

            {/* Achievements */}
            <FieldCard title="Achievements" icon={Award}>
              <div className="space-y-3">
                {achievements.map(a => (
                  <div key={a.id} className="p-3 bg-muted/40 rounded-lg relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 hover:text-destructive"
                      onClick={() => removeItem(setAchievements, a.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Input placeholder="Dean's List / Hackathon Winner / Paper Published" value={a.title}
                      onChange={e => updateField(setAchievements, a.id, "title", e.target.value)}
                      className="mb-2" />
                    <Textarea placeholder="Brief description..." value={a.description}
                      onChange={e => updateField(setAchievements, a.id, "description", e.target.value)}
                      className="min-h-[40px] resize-none" />
                  </div>
                ))}
                <Button variant="outline" size="sm"
                  onClick={() => addItem(setAchievements, { title: "", description: "" })}>
                  <Plus className="w-3 h-3 mr-1" /> Add Achievement
                </Button>
              </div>
            </FieldCard>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
