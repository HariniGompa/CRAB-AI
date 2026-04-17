import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Download, Plus, Trash2, Layout, User, Briefcase, FolderOpen, GraduationCap, Award, Palette, Save, CheckCircle, FolderHeart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TemplateId = "midnight"|"aurora"|"neon"|"paper"|"ocean"|"sakura"|"carbon"|"glass"|"retro"|"forest"|"sunset"|"monochrome";

const TEMPLATES: { id: TemplateId; name: string; desc: string; preview: string }[] = [
  { id: "midnight", name: "Midnight",    desc: "Dark luxury — deep navy, gold accents",         preview: "linear-gradient(135deg,#0f172a,#1e3a5f)" },
  { id: "aurora",   name: "Aurora",      desc: "Gradient hero — purple to pink, animated",      preview: "linear-gradient(135deg,#7c3aed,#db2777)" },
  { id: "neon",     name: "Neon",        desc: "Dark bg, glowing cyan/green neon borders",      preview: "linear-gradient(135deg,#0d0d0d,#00ff88)" },
  { id: "paper",    name: "Paper",       desc: "Warm white, serif fonts, editorial feel",       preview: "linear-gradient(135deg,#fdf6ec,#c9a96e)" },
  { id: "ocean",    name: "Ocean",       desc: "Deep teal waves, clean and professional",       preview: "linear-gradient(135deg,#0c4a6e,#0891b2)" },
  { id: "sakura",   name: "Sakura",      desc: "Soft pink & white, Japanese minimalism",        preview: "linear-gradient(135deg,#fdf2f8,#f472b6)" },
  { id: "carbon",   name: "Carbon",      desc: "Dark carbon fiber texture, tech startup vibe",  preview: "linear-gradient(135deg,#111,#374151)" },
  { id: "glass",    name: "Glassmorphism",desc: "Frosted glass cards, blur effects",            preview: "linear-gradient(135deg,#667eea,#764ba2)" },
  { id: "retro",    name: "Retro",       desc: "90s vibe — bright colors, pixelated borders",   preview: "linear-gradient(135deg,#fbbf24,#ef4444)" },
  { id: "forest",   name: "Forest",      desc: "Deep greens, organic, eco-friendly feel",       preview: "linear-gradient(135deg,#052e16,#16a34a)" },
  { id: "sunset",   name: "Sunset",      desc: "Warm orange-red gradient, bold & energetic",    preview: "linear-gradient(135deg,#ea580c,#dc2626)" },
  { id: "monochrome",name:"Monochrome",  desc: "Pure B&W, typography-driven, ultra-minimal",   preview: "linear-gradient(135deg,#000,#6b7280)" },
];

interface Project  { id:string;name:string;description:string;tech:string;link:string; }
interface ExpEntry { id:string;company:string;role:string;duration:string;description:string; }
interface EduEntry { id:string;institution:string;degree:string;year:string; }

const uid = () => Date.now().toString()+Math.random().toString(36).slice(2);

export default function PortfolioGenerator() {
  const [template, setTemplate]   = useState<TemplateId>("midnight");
  const [activeTab,setActiveTab]  = useState<"edit"|"preview">("edit");
  const [section,  setSection]    = useState("personal");
  const previewRef                = useRef<HTMLIFrameElement>(null);
  const [savedPortfolios, setSavedPortfolios] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load saved portfolios from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("crab_ai_portfolios");
      if (raw) setSavedPortfolios(JSON.parse(raw));
    } catch {}
  }, []);

  const [personal, setPersonal]   = useState({ fullName:"", title:"", email:"", phone:"", location:"", github:"", linkedin:"", website:"", about:"" });
  const [skills,   setSkills]     = useState("");
  const [achievements, setAchievements] = useState("");
  const [projects, setProjects]   = useState<Project[]>([{ id:"1",name:"",description:"",tech:"",link:"" }]);
  const [experiences,setExperiences]=useState<ExpEntry[]>([{ id:"1",company:"",role:"",duration:"",description:"" }]);
  const [education,setEducation]  = useState<EduEntry[]>([{ id:"1",institution:"",degree:"",year:"" }]);

  const addP   = () => setProjects(p=>[...p,{id:uid(),name:"",description:"",tech:"",link:""}]);
  const remP   = (id:string) => projects.length>1 && setProjects(p=>p.filter(x=>x.id!==id));
  const updP   = (id:string,f:keyof Project,v:string) => setProjects(p=>p.map(x=>x.id===id?{...x,[f]:v}:x));
  const addE   = () => setExperiences(p=>[...p,{id:uid(),company:"",role:"",duration:"",description:""}]);
  const remE   = (id:string) => experiences.length>1 && setExperiences(p=>p.filter(x=>x.id!==id));
  const updE   = (id:string,f:keyof ExpEntry,v:string) => setExperiences(p=>p.map(x=>x.id===id?{...x,[f]:v}:x));
  const addEd  = () => setEducation(p=>[...p,{id:uid(),institution:"",degree:"",year:""}]);
  const remEd  = (id:string) => education.length>1 && setEducation(p=>p.filter(x=>x.id!==id));
  const updEd  = (id:string,f:keyof EduEntry,v:string) => setEducation(p=>p.map(x=>x.id===id?{...x,[f]:v}:x));

  const generateHTML = (): string => {
    const skillList = skills.split(",").map(s=>s.trim()).filter(Boolean);
    const achList   = achievements.split("\n").map(a=>a.trim()).filter(Boolean);
    const validP    = projects.filter(p=>p.name);
    const validE    = experiences.filter(e=>e.company||e.role);
    const validEd   = education.filter(e=>e.institution||e.degree);

    const themes: Record<TemplateId,any> = {
      midnight: { bg:"#0f172a",card:"#1e293b",accent:"#f59e0b",accent2:"#fbbf24",text:"#f1f5f9",sub:"#94a3b8",border:"#334155",hero:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",font:"'Segoe UI',system-ui,sans-serif",animation:"fadeInUp 0.8s ease forwards",cardStyle:"border:1px solid rgba(245,158,11,0.2);box-shadow:0 4px 24px rgba(0,0,0,0.3)" },
      aurora:   { bg:"#1a1a2e",card:"rgba(255,255,255,0.05)",accent:"#c084fc",accent2:"#f472b6",text:"#f9fafb",sub:"#d1d5db",border:"rgba(255,255,255,0.1)",hero:"linear-gradient(135deg,#7c3aed 0%,#db2777 50%,#9333ea 100%)",font:"'Segoe UI',system-ui,sans-serif",animation:"slideInLeft 0.6s ease forwards",cardStyle:"backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);box-shadow:0 8px 32px rgba(0,0,0,0.3)" },
      neon:     { bg:"#0a0a0a",card:"#111111",accent:"#00ff88",accent2:"#00d4ff",text:"#f0f0f0",sub:"#a0a0a0",border:"#1a1a1a",hero:"#0a0a0a",font:"'Courier New',monospace",animation:"neonPulse 2s ease-in-out infinite",cardStyle:"border:1px solid #00ff8840;box-shadow:0 0 20px rgba(0,255,136,0.1)" },
      paper:    { bg:"#fdf6ec",card:"#fff9f0",accent:"#c9a96e",accent2:"#a0785a",text:"#2d1b00",sub:"#6b4c2a",border:"#e8d5b0",hero:"linear-gradient(135deg,#fdf6ec,#f5e6c8)",font:"Georgia,'Times New Roman',serif",animation:"fadeIn 1s ease forwards",cardStyle:"border:1px solid #e8d5b0;box-shadow:2px 4px 12px rgba(0,0,0,0.08)" },
      ocean:    { bg:"#0c4a6e",card:"#075985",accent:"#38bdf8",accent2:"#7dd3fc",text:"#f0f9ff",sub:"#bae6fd",border:"#0369a1",hero:"linear-gradient(135deg,#0c4a6e 0%,#0369a1 50%,#0891b2 100%)",font:"'Segoe UI',system-ui,sans-serif",animation:"slideUp 0.7s ease forwards",cardStyle:"border:1px solid rgba(56,189,248,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.2)" },
      sakura:   { bg:"#fff0f7",card:"#fff",accent:"#f472b6",accent2:"#ec4899",text:"#1f0a14",sub:"#9d4e6f",border:"#fbcfe8",hero:"linear-gradient(135deg,#fdf2f8,#fce7f3)",font:"'Segoe UI',system-ui,sans-serif",animation:"float 0.8s ease forwards",cardStyle:"border:1px solid #fbcfe8;box-shadow:0 4px 20px rgba(244,114,182,0.1)" },
      carbon:   { bg:"#111111",card:"#1c1c1c",accent:"#6366f1",accent2:"#818cf8",text:"#f9fafb",sub:"#9ca3af",border:"#2d2d2d",hero:"repeating-linear-gradient(45deg,#111 0px,#111 2px,#1a1a1a 2px,#1a1a1a 4px)",font:"'Segoe UI',system-ui,sans-serif",animation:"slideInRight 0.6s ease forwards",cardStyle:"border:1px solid #2d2d2d;box-shadow:inset 0 1px 0 rgba(255,255,255,0.05)" },
      glass:    { bg:"linear-gradient(135deg,#667eea,#764ba2)",card:"rgba(255,255,255,0.1)",accent:"#fff",accent2:"#e0e7ff",text:"#fff",sub:"rgba(255,255,255,0.7)",border:"rgba(255,255,255,0.2)",hero:"linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f64f59 100%)",font:"'Segoe UI',system-ui,sans-serif",animation:"glassIn 0.8s ease forwards",cardStyle:"backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.2);box-shadow:0 8px 32px rgba(0,0,0,0.2)" },
      retro:    { bg:"#fffbeb",card:"#fff",accent:"#ef4444",accent2:"#fbbf24",text:"#1f2937",sub:"#374151",border:"#111",hero:"#fbbf24",font:"'Courier New',Courier,monospace",animation:"bounceIn 0.6s ease forwards",cardStyle:"border:3px solid #111;box-shadow:4px 4px 0 #111" },
      forest:   { bg:"#052e16",card:"#14532d",accent:"#4ade80",accent2:"#86efac",text:"#f0fdf4",sub:"#bbf7d0",border:"#166534",hero:"linear-gradient(135deg,#052e16,#14532d,#166534)",font:"'Segoe UI',system-ui,sans-serif",animation:"growIn 0.7s ease forwards",cardStyle:"border:1px solid #166534;box-shadow:0 4px 20px rgba(0,0,0,0.3)" },
      sunset:   { bg:"#1c0a00",card:"#2d1000",accent:"#f97316",accent2:"#fbbf24",text:"#fff7ed",sub:"#fed7aa",border:"#7c2d12",hero:"linear-gradient(135deg,#ea580c,#dc2626,#991b1b)",font:"'Segoe UI',system-ui,sans-serif",animation:"burnIn 0.8s ease forwards",cardStyle:"border:1px solid rgba(249,115,22,0.3);box-shadow:0 4px 24px rgba(0,0,0,0.4)" },
      monochrome:{ bg:"#fff",card:"#f9f9f9",accent:"#000",accent2:"#333",text:"#000",sub:"#555",border:"#000",hero:"#000",font:"'Helvetica Neue',Arial,sans-serif",animation:"fadeIn 0.6s ease forwards",cardStyle:"border:1px solid #000" },
    };

    const t = themes[template];
    const isRetro = template === "retro";
    const isNeon  = template === "neon";
    const isMono  = template === "monochrome";
    const isGlass = template === "glass";
    const isPaper = template === "paper";
    const heroIsGradient = ["midnight","aurora","ocean","sakura","carbon","forest","sunset","glass"].includes(template);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${personal.fullName||"Portfolio"} — Portfolio</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{font-family:${t.font};background:${heroIsGradient||isGlass?'#111':t.bg};color:${t.text};line-height:1.7;min-height:100vh;}
  ${isGlass?`body{background:${t.hero};}`:""}

  /* ── Animations ── */
  @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideInLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes glassIn{from{opacity:0;backdrop-filter:blur(0px)}to{opacity:1;backdrop-filter:blur(20px)}}
  @keyframes bounceIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
  @keyframes growIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
  @keyframes burnIn{from{opacity:0;filter:brightness(2)}to{opacity:1;filter:brightness(1)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  ${isNeon?`@keyframes neonGlow{0%,100%{box-shadow:0 0 10px ${t.accent},0 0 20px ${t.accent}}50%{box-shadow:0 0 20px ${t.accent},0 0 40px ${t.accent},0 0 60px ${t.accent}}}`:""}

  /* ── Navbar ── */
  nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 40px;display:flex;justify-content:space-between;align-items:center;
    ${isGlass?"backdrop-filter:blur(20px);background:rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.1);":
      isMono?"background:#fff;border-bottom:2px solid #000;":
      isRetro?"background:#fbbf24;border-bottom:3px solid #111;":
      `background:${t.bg}cc;backdrop-filter:blur(10px);border-bottom:1px solid ${t.border};`}}
  .nav-logo{font-size:1.1rem;font-weight:700;color:${t.accent};${isRetro?"text-transform:uppercase;letter-spacing:2px;":""}${isNeon?`text-shadow:0 0 10px ${t.accent};`:""}}
  .nav-links{display:flex;gap:24px;}
  .nav-links a{color:${t.sub};text-decoration:none;font-size:.875rem;transition:color .2s;${isRetro?"font-weight:700;":""}${isNeon?`text-shadow:0 0 6px ${t.accent};`:""}}
  .nav-links a:hover{color:${t.accent};}

  /* ── Hero ── */
  .hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;
    padding:100px 40px 60px;position:relative;overflow:hidden;
    background:${t.hero};}
  ${isPaper?`.hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a96e' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}`:
    isNeon?`.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,255,136,0.05) 0%,transparent 70%);}`:
    isRetro?`.hero{background:#fbbf24;border-bottom:3px solid #111;}`:
    template==="midnight"?`.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(245,158,11,0.1) 0%,transparent 60%);}`:
    template==="aurora"?`.hero::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,rgba(192,132,252,0.1),transparent);animation:float 6s linear infinite;}`:""
  }
  .hero-tag{display:inline-block;padding:6px 18px;border-radius:999px;font-size:.8rem;font-weight:600;margin-bottom:20px;
    ${isRetro?`background:#ef4444;color:#fff;border:2px solid #111;`:
      isMono?`background:#000;color:#fff;`:
      `background:${t.accent}22;color:${t.accent};border:1px solid ${t.accent}44;`}
    ${isNeon?`box-shadow:0 0 10px ${t.accent};animation:neonGlow 2s ease-in-out infinite;`:""}}
  .hero h1{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;margin-bottom:16px;
    ${isNeon?`color:${t.text};text-shadow:0 0 20px ${t.accent},0 0 40px ${t.accent};`:
      isPaper?`color:${t.text};`:
      isRetro?`color:#111;text-shadow:3px 3px 0 ${t.accent};`:
      isMono?`color:#000;`:
      `background:${template==="aurora"?"linear-gradient(135deg,#fff,#e0e7ff)":template==="glass"?"linear-gradient(135deg,#fff,rgba(255,255,255,0.7))":template==="midnight"?"linear-gradient(135deg,#f1f5f9,#f59e0b)":"none"};-webkit-background-clip:${["aurora","glass","midnight"].includes(template)?"text":"initial"};-webkit-text-fill-color:${["aurora","glass","midnight"].includes(template)?"transparent":"initial"};color:${t.text};`}}
  .hero-title{font-size:1.25rem;color:${t.accent};margin-bottom:20px;font-weight:${isPaper?"400":"600"};${isPaper?"font-style:italic;":""}${isNeon?`text-shadow:0 0 10px ${t.accent};`:""}}
  .hero-bio{font-size:1rem;color:${t.sub};max-width:600px;margin:0 auto 32px;${isPaper?"font-style:italic;":""}}
  .hero-links{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
  .hero-link{padding:10px 24px;border-radius:${isRetro?"0":"8px"};font-size:.875rem;font-weight:600;text-decoration:none;transition:all .2s;
    ${isRetro?"border:2px solid #111;background:#fff;color:#111;":
      isMono?"border:2px solid #000;color:#000;":
      isNeon?`border:1px solid ${t.accent};color:${t.accent};text-shadow:0 0 8px ${t.accent};box-shadow:0 0 10px ${t.accent}40;`:
      `background:${t.accent};color:${template==="midnight"?"#0f172a":"#fff"};`}}
  .hero-link:hover{${isRetro?"background:#111;color:#fff;":isMono?"background:#000;color:#fff;":"opacity:.85;transform:translateY(-2px);"}}

  /* ── Container ── */
  .container{max-width:1000px;margin:0 auto;padding:0 24px;}

  /* ── Section ── */
  section{padding:80px 0;}
  .section-header{text-align:center;margin-bottom:48px;}
  .section-label{display:inline-block;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:3px;
    color:${t.accent};margin-bottom:12px;${isNeon?`text-shadow:0 0 8px ${t.accent};`:""}}
  .section-title{font-size:2rem;font-weight:700;color:${t.text};${isPaper?"font-style:italic;":""}${isNeon?`text-shadow:0 0 12px rgba(255,255,255,0.3);`:""}}

  /* ── Cards ── */
  .card{background:${isGlass?"rgba(255,255,255,0.08)":t.card};border-radius:${isRetro?"0":"12px"};padding:24px;margin-bottom:16px;
    ${t.cardStyle};transition:transform .2s;}
  .card:hover{transform:${isRetro?"none":"translateY(-3px)"};
    ${isNeon?"box-shadow:0 0 30px rgba(0,255,136,0.2);":""}}
  .card-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;}
  .card-title{font-size:1.05rem;font-weight:700;color:${t.text};}
  .card-subtitle{font-size:.875rem;color:${t.accent};font-weight:600;}
  .card-meta{font-size:.8rem;color:${t.sub};}
  .card-body{font-size:.9rem;color:${t.sub};margin-top:8px;}

  /* ── Skills ── */
  .skills-wrap{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
  .skill{padding:8px 20px;border-radius:${isRetro?"0":"999px"};font-size:.875rem;font-weight:600;
    ${isRetro?`border:2px solid #111;background:#fbbf24;color:#111;`:
      isMono?`border:2px solid #000;color:#000;`:
      isNeon?`border:1px solid ${t.accent};color:${t.accent};text-shadow:0 0 6px ${t.accent};box-shadow:0 0 8px ${t.accent}30;`:
      `background:${t.card};color:${t.accent};border:1px solid ${t.accent}40;`}}

  /* ── Tech tags ── */
  .tech-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
  .tech-tag{padding:3px 10px;border-radius:${isRetro?"0":"4px"};font-size:.78rem;
    ${isRetro?`border:1.5px solid #111;background:#ef4444;color:#fff;`:
      `background:${t.bg};border:1px solid ${t.border};color:${t.sub};`}}

  /* ── Project link ── */
  .proj-link{display:inline-block;margin-top:12px;font-size:.8rem;color:${t.accent};text-decoration:none;font-weight:600;
    ${isNeon?`text-shadow:0 0 6px ${t.accent};`:""}}
  .proj-link:hover{text-decoration:underline;}

  /* ── Achievements ── */
  .ach-list{list-style:none;}
  .ach-list li{padding:10px 0;border-bottom:1px solid ${t.border};color:${t.sub};font-size:.9rem;}
  .ach-list li::before{content:"${isRetro?"★":isNeon?"⚡":template==="midnight"?"✦":"●"} ";color:${t.accent};}

  /* ── Contact ── */
  .contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;}
  .contact-item{${isGlass?"backdrop-filter:blur(10px);":""};background:${t.card};border:1px solid ${t.border};
    border-radius:${isRetro?"0":"10px"};padding:16px;${isRetro?"border:2px solid #111;":""}}
  .contact-label{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:${t.sub};margin-bottom:4px;}
  .contact-value{font-size:.9rem;color:${t.text};font-weight:500;}

  /* ── Footer ── */
  footer{text-align:center;padding:32px;color:${t.sub};font-size:.8rem;border-top:1px solid ${t.border};}

  /* ── Section BG alternating ── */
  .section-alt{background:${isGlass?"transparent":template==="monochrome"?"#f5f5f5":t.card};}
</style>
</head>
<body>

<!-- Navbar -->
<nav>
  <div class="nav-logo">${personal.fullName||"Portfolio"}</div>
  <div class="nav-links">
    ${skillList.length?"<a href='#skills'>Skills</a>":""}
    ${validP.length?"<a href='#projects'>Projects</a>":""}
    ${validE.length?"<a href='#experience'>Experience</a>":""}
    ${validEd.length?"<a href='#education'>Education</a>":""}
    ${personal.email?"<a href='#contact'>Contact</a>":""}
  </div>
</nav>

<!-- Hero -->
<section class="hero" id="home">
  ${personal.title?`<div class="hero-tag">${personal.title}</div>`:""}
  <h1 style="animation:${t.animation}">${personal.fullName||"Your Name"}</h1>
  ${personal.title?`<div class="hero-title">${personal.title}</div>`:""}
  ${personal.about?`<p class="hero-bio" style="animation:fadeInUp 1s ease 0.2s both">${personal.about}</p>`:""}
  <div class="hero-links" style="animation:fadeInUp 1s ease 0.4s both">
    ${personal.email?`<a href="mailto:${personal.email}" class="hero-link">✉ Email</a>`:""}
    ${personal.github?`<a href="${personal.github}" target="_blank" class="hero-link">⌥ GitHub</a>`:""}
    ${personal.linkedin?`<a href="${personal.linkedin}" target="_blank" class="hero-link">in LinkedIn</a>`:""}
    ${personal.website?`<a href="${personal.website}" target="_blank" class="hero-link">🌐 Website</a>`:""}
  </div>
</section>

<!-- Skills -->
${skillList.length?`
<section id="skills" class="section-alt">
  <div class="container">
    <div class="section-header">
      <div class="section-label">What I Know</div>
      <h2 class="section-title">Skills & Technologies</h2>
    </div>
    <div class="skills-wrap">
      ${skillList.map(s=>`<span class="skill">${s}</span>`).join("")}
    </div>
  </div>
</section>`:""}

<!-- Projects -->
${validP.length?`
<section id="projects">
  <div class="container">
    <div class="section-header">
      <div class="section-label">What I've Built</div>
      <h2 class="section-title">Featured Projects</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
      ${validP.map(p=>`
      <div class="card">
        <div class="card-title">${p.name}</div>
        ${p.description?`<p class="card-body">${p.description}</p>`:""}
        ${p.tech?`<div class="tech-tags">${p.tech.split(",").map(t=>`<span class="tech-tag">${t.trim()}</span>`).join("")}</div>`:""}
        ${p.link?`<a href="${p.link}" target="_blank" class="proj-link">View Project →</a>`:""}
      </div>`).join("")}
    </div>
  </div>
</section>`:""}

<!-- Experience -->
${validE.length?`
<section id="experience" class="section-alt">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Where I've Worked</div>
      <h2 class="section-title">Experience</h2>
    </div>
    ${validE.map(e=>`
    <div class="card">
      <div class="card-row">
        <div><div class="card-title">${e.role}</div><div class="card-subtitle">${e.company}</div></div>
        <div class="card-meta">${e.duration}</div>
      </div>
      ${e.description?`<p class="card-body">${e.description}</p>`:""}
    </div>`).join("")}
  </div>
</section>`:""}

<!-- Education -->
${validEd.length?`
<section id="education">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Academic Background</div>
      <h2 class="section-title">Education</h2>
    </div>
    ${validEd.map(e=>`
    <div class="card">
      <div class="card-row">
        <div><div class="card-title">${e.degree}</div><div class="card-subtitle">${e.institution}</div></div>
        <div class="card-meta">${e.year}</div>
      </div>
    </div>`).join("")}
  </div>
</section>`:""}

<!-- Achievements -->
${achList.length?`
<section class="section-alt">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Recognition</div>
      <h2 class="section-title">Achievements</h2>
    </div>
    <ul class="ach-list">${achList.map(a=>`<li>${a}</li>`).join("")}</ul>
  </div>
</section>`:""}

<!-- Contact -->
${(personal.email||personal.phone||personal.location)?`
<section id="contact">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Get In Touch</div>
      <h2 class="section-title">Contact Me</h2>
    </div>
    <div class="contact-grid">
      ${personal.email?`<div class="contact-item"><div class="contact-label">Email</div><div class="contact-value">${personal.email}</div></div>`:""}
      ${personal.phone?`<div class="contact-item"><div class="contact-label">Phone</div><div class="contact-value">${personal.phone}</div></div>`:""}
      ${personal.location?`<div class="contact-item"><div class="contact-label">Location</div><div class="contact-value">${personal.location}</div></div>`:""}
    </div>
  </div>
</section>`:""}

<footer>Built with CRAB AI Portfolio Generator &nbsp;·&nbsp; ${personal.fullName||""}</footer>
</body>
</html>`;
  };

  const handlePreview = () => {
    setActiveTab("preview");
    setTimeout(() => {
      if (previewRef.current) {
        const doc = previewRef.current.contentDocument || previewRef.current.contentWindow?.document;
        if (doc) { doc.open(); doc.write(generateHTML()); doc.close(); }
      }
    }, 80);
  };

  const handleDownload = () => {
    const html = generateHTML();
    const blob = new Blob([html],{type:"text/html"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download=`${personal.fullName||"portfolio"}.html`.replace(/\s+/g,"_");
    a.click(); URL.revokeObjectURL(url);
    toast.success("Portfolio downloaded!");
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      const portfolio = {
        id: Date.now().toString(),
        name: personal.fullName || "My Portfolio",
        template,
        savedAt: new Date().toLocaleDateString(),
        html: generateHTML(),
        personal: { ...personal },
        skills,
        achievements,
        projects: [...projects],
        experiences: [...experiences],
        education: [...education],
      };
      const existing: any[] = (() => { try { return JSON.parse(localStorage.getItem("crab_ai_portfolios") || "[]"); } catch { return []; } })();
      const updated = [portfolio, ...existing.filter((p: any) => p.name !== portfolio.name)].slice(0, 5);
      localStorage.setItem("crab_ai_portfolios", JSON.stringify(updated));
      setSavedPortfolios(updated);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      toast.success("Portfolio saved!");
    } catch {
      toast.error("Failed to save portfolio");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPortfolio = (p: any) => {
    if (p.personal)     setPersonal(p.personal);
    if (p.skills)       setSkills(p.skills);
    if (p.achievements) setAchievements(p.achievements);
    if (p.projects)     setProjects(p.projects);
    if (p.experiences)  setExperiences(p.experiences);
    if (p.education)    setEducation(p.education);
    if (p.template)     setTemplate(p.template);
    setShowSaved(false);
    setActiveTab("edit");
    toast.success(`Loaded "${p.name}"!`);
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedPortfolios.filter((p: any) => p.id !== id);
    localStorage.setItem("crab_ai_portfolios", JSON.stringify(updated));
    setSavedPortfolios(updated);
    toast.success("Portfolio deleted");
  };

  const SECTIONS = [
    { id:"personal", label:"Personal", icon:User },
    { id:"skills",   label:"Skills",   icon:Award },
    { id:"projects", label:"Projects", icon:FolderOpen },
    { id:"experience",label:"Experience",icon:Briefcase },
    { id:"education",label:"Education", icon:GraduationCap },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Portfolio Generator</h1>
              <p className="text-muted-foreground text-sm">Create a stunning portfolio website</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {savedPortfolios.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowSaved(p => !p)}>
                <FolderHeart className="w-4 h-4 mr-1.5"/>Saved ({savedPortfolios.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              {justSaved
                ? <><CheckCircle className="w-4 h-4 mr-1.5 text-green-500"/>Saved!</>
                : <><Save className="w-4 h-4 mr-1.5"/>Save</>}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview}><Eye className="w-4 h-4 mr-1.5"/>Preview</Button>
            <Button size="sm" onClick={handleDownload}><Download className="w-4 h-4 mr-1.5"/>Download</Button>
          </div>
        </div>

        {/* Saved portfolios panel */}
        {showSaved && savedPortfolios.length > 0 && (
          <div className="glass-card p-4 mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-primary"/> Saved Portfolios
            </h3>
            <div className="space-y-2">
              {savedPortfolios.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.template} template · Saved {p.savedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleLoadPortfolio(p)}>Load</Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSaved(p.id)}>
                      <Trash2 className="w-3 h-3"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit/Preview toggle */}
        <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg w-fit">
          {(["edit","preview"] as const).map(tab => (
            <button key={tab} onClick={tab==="preview"?handlePreview:()=>setActiveTab("edit")}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                activeTab===tab?"bg-background shadow text-foreground":"text-muted-foreground hover:text-foreground")}>
              {tab==="edit"?"✏️ Edit":"👁️ Preview"}
            </button>
          ))}
        </div>

        {activeTab === "preview" ? (
          <div className="rounded-xl overflow-hidden border border-border shadow-xl" style={{height:"80vh"}}>
            <iframe ref={previewRef} className="w-full h-full border-0" title="Portfolio Preview" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar */}
            <div className="space-y-3">
              {/* Template grid */}
              <div className="glass-card p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Palette className="w-3 h-3"/>Template
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={()=>setTemplate(t.id)}
                      className={cn("relative rounded-lg overflow-hidden border-2 transition-all group",
                        template===t.id?"border-primary":"border-transparent hover:border-primary/40")}>
                      <div className="h-12 w-full" style={{background:t.preview}} />
                      <div className="absolute inset-0 flex items-end">
                        <span className="text-white text-xs font-bold px-1.5 pb-1 bg-gradient-to-t from-black/60 w-full">
                          {t.name}
                        </span>
                      </div>
                      {template===t.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center italic">
                  {TEMPLATES.find(t=>t.id===template)?.desc}
                </p>
              </div>

              {/* Nav sections */}
              {SECTIONS.map(s => (
                <button key={s.id} onClick={()=>setSection(s.id)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    section===s.id?"bg-primary/10 text-primary font-medium":"text-muted-foreground hover:bg-muted")}>
                  <s.icon className="w-4 h-4"/>{s.label}
                </button>
              ))}
            </div>

            {/* Right form */}
            <div className="lg:col-span-3 glass-card p-6">
              {section==="personal" && (
                <div className="space-y-4">
                  <h2 className="font-semibold mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {([
                      ["fullName","Full Name","Monisha Mudduluru"],
                      ["title","Job Title / Tagline","Data Analyst & AI Enthusiast"],
                      ["email","Email","your@email.com"],
                      ["phone","Phone","+91 9999999999"],
                      ["location","Location","Hyderabad, India"],
                      ["github","GitHub URL","https://github.com/username"],
                      ["linkedin","LinkedIn URL","https://linkedin.com/in/username"],
                      ["website","Website","https://yoursite.com"],
                    ] as [keyof typeof personal,string,string][]).map(([f,l,p])=>(
                      <div key={f}>
                        <Label className="text-sm">{l}</Label>
                        <Input className="mt-1" placeholder={p} value={personal[f]}
                          onChange={e=>setPersonal({...personal,[f]:e.target.value})}/>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label className="text-sm">About Me</Label>
                    <Textarea className="mt-1 min-h-[90px] resize-none" placeholder="Write a short bio..." value={personal.about} onChange={e=>setPersonal({...personal,about:e.target.value})}/>
                  </div>
                  <div>
                    <Label className="text-sm">Achievements (one per line)</Label>
                    <Textarea className="mt-1 min-h-[70px] resize-none" placeholder={"Winner of Hackathon 2024\nDean's List 2023\nPublished research paper"} value={achievements} onChange={e=>setAchievements(e.target.value)}/>
                  </div>
                </div>
              )}

              {section==="skills" && (
                <div>
                  <h2 className="font-semibold mb-4">Skills</h2>
                  <Label className="text-sm">Skills (comma separated)</Label>
                  <Textarea className="mt-1 min-h-[120px] resize-none" placeholder="Python, SQL, Machine Learning, TensorFlow, Pandas, Power BI, Git, FastAPI..." value={skills} onChange={e=>setSkills(e.target.value)}/>
                  <p className="text-xs text-muted-foreground mt-2">Each skill becomes a styled badge on your portfolio</p>
                </div>
              )}

              {section==="projects" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Projects</h2>
                    <Button variant="outline" size="sm" onClick={addP}><Plus className="w-3 h-3 mr-1"/>Add</Button>
                  </div>
                  {projects.map((p,i)=>(
                    <div key={p.id} className="p-4 bg-muted/40 rounded-lg space-y-3 mb-4 relative">
                      {projects.length>1&&<button onClick={()=>remP(p.id)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4"/></button>}
                      <p className="text-xs font-medium text-muted-foreground">Project {i+1}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs">Name</Label><Input className="mt-1" placeholder="CRAB AI" value={p.name} onChange={e=>updP(p.id,"name",e.target.value)}/></div>
                        <div><Label className="text-xs">Link</Label><Input className="mt-1" placeholder="https://github.com/..." value={p.link} onChange={e=>updP(p.id,"link",e.target.value)}/></div>
                      </div>
                      <div><Label className="text-xs">Description</Label><Textarea className="mt-1 min-h-[60px] resize-none" placeholder="What does it do?" value={p.description} onChange={e=>updP(p.id,"description",e.target.value)}/></div>
                      <div><Label className="text-xs">Technologies</Label><Input className="mt-1" placeholder="Python, FastAPI, React" value={p.tech} onChange={e=>updP(p.id,"tech",e.target.value)}/></div>
                    </div>
                  ))}
                </div>
              )}

              {section==="experience" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Experience & Internships</h2>
                    <Button variant="outline" size="sm" onClick={addE}><Plus className="w-3 h-3 mr-1"/>Add</Button>
                  </div>
                  {experiences.map((e,i)=>(
                    <div key={e.id} className="p-4 bg-muted/40 rounded-lg space-y-3 mb-4 relative">
                      {experiences.length>1&&<button onClick={()=>remE(e.id)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4"/></button>}
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs">Company</Label><Input className="mt-1" placeholder="Edunet Foundation" value={e.company} onChange={ev=>updE(e.id,"company",ev.target.value)}/></div>
                        <div><Label className="text-xs">Role</Label><Input className="mt-1" placeholder="AI Intern" value={e.role} onChange={ev=>updE(e.id,"role",ev.target.value)}/></div>
                      </div>
                      <div><Label className="text-xs">Duration</Label><Input className="mt-1" placeholder="Jan 2025 - Ongoing" value={e.duration} onChange={ev=>updE(e.id,"duration",ev.target.value)}/></div>
                      <div><Label className="text-xs">Description</Label><Textarea className="mt-1 min-h-[60px] resize-none" placeholder="What did you do?" value={e.description} onChange={ev=>updE(e.id,"description",ev.target.value)}/></div>
                    </div>
                  ))}
                </div>
              )}

              {section==="education" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Education</h2>
                    <Button variant="outline" size="sm" onClick={addEd}><Plus className="w-3 h-3 mr-1"/>Add</Button>
                  </div>
                  {education.map((e,i)=>(
                    <div key={e.id} className="p-4 bg-muted/40 rounded-lg space-y-3 mb-4 relative">
                      {education.length>1&&<button onClick={()=>remEd(e.id)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4"/></button>}
                      <div><Label className="text-xs">Institution</Label><Input className="mt-1" placeholder="Malla Reddy College of Engineering" value={e.institution} onChange={ev=>updEd(e.id,"institution",ev.target.value)}/></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs">Degree</Label><Input className="mt-1" placeholder="B.Tech AI & DS" value={e.degree} onChange={ev=>updEd(e.id,"degree",ev.target.value)}/></div>
                        <div><Label className="text-xs">Year</Label><Input className="mt-1" placeholder="2022 - 2026" value={e.year} onChange={ev=>updEd(e.id,"year",ev.target.value)}/></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
