import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Layout,
  Trash2,
  Eye,
  Download,
  Calendar,
  User,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useResumes } from "@/hooks/useResumes";

interface SavedPortfolio {
  id: string;
  name: string;
  template: string;
  savedAt: string;
  html: string;
  personal?: { fullName?: string; title?: string; email?: string };
}

export default function SavedItems() {
  const navigate = useNavigate();
  const { resumes, loading: resumesLoading, deleteResume, refetch } = useResumes();

  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [activeTab, setActiveTab] = useState<"resumes" | "portfolios">("resumes");
  const [previewPortfolio, setPreviewPortfolio] = useState<SavedPortfolio | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load portfolios from localStorage
  const loadPortfolios = () => {
    try {
      const raw = localStorage.getItem("crab_ai_portfolios");
      setPortfolios(raw ? JSON.parse(raw) : []);
    } catch {
      setPortfolios([]);
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  const handleDeleteResume = async (id: string) => {
    setDeletingId(id);
    await deleteResume(id);
    setDeletingId(null);
  };

  const handleDeletePortfolio = (id: string) => {
    setDeletingId(id);
    try {
      const updated = portfolios.filter((p) => p.id !== id);
      localStorage.setItem("crab_ai_portfolios", JSON.stringify(updated));
      setPortfolios(updated);
      toast.success("Portfolio deleted");
    } catch {
      toast.error("Failed to delete portfolio");
    }
    setDeletingId(null);
  };

  const handleDownloadPortfolio = (portfolio: SavedPortfolio) => {
    const blob = new Blob([portfolio.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${portfolio.name.replace(/\s+/g, "_")}_portfolio.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Portfolio downloaded!");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const templateBadgeColor: Record<string, string> = {
    professional: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    minimal:      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    modern:       "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    creative:     "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    midnight:     "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    aurora:       "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    neon:         "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    paper:        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ocean:        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    sakura:       "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    carbon:       "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    glass:        "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    retro:        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    forest:       "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    sunset:       "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    monochrome:   "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Saved Items</h1>
            <p className="text-muted-foreground text-sm">
              View and manage your saved resumes and portfolios.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { refetch(); loadPortfolios(); }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab("resumes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "resumes"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Resumes
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-semibold">
              {resumes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("portfolios")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "portfolios"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layout className="w-4 h-4" />
            Portfolios
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-semibold">
              {portfolios.length}
            </span>
          </button>
        </div>

        {/* ── RESUMES TAB ── */}
        {activeTab === "resumes" && (
          <>
            {resumesLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Loading resumes…
              </div>
            ) : resumes.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-10 h-10 text-muted-foreground/50" />}
                title="No saved resumes yet"
                description="Build and save a resume to see it here."
                action={{ label: "Build a Resume", onClick: () => navigate("/dashboard/resume-builder") }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="glass-card p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{resume.name || "Untitled Resume"}</h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {resume.user_type || "—"} · {resume.template || "—"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          templateBadgeColor[resume.template] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {resume.template || "default"}
                      </span>
                    </div>

                    {/* Info row */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {resume.form_data?.fullName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {resume.form_data.fullName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(resume.created_at)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => navigate("/dashboard/resume-builder")}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Open Builder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        disabled={deletingId === resume.id}
                        onClick={() => handleDeleteResume(resume.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === resume.id ? "Deleting…" : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PORTFOLIOS TAB ── */}
        {activeTab === "portfolios" && (
          <>
            {portfolios.length === 0 ? (
              <EmptyState
                icon={<Layout className="w-10 h-10 text-muted-foreground/50" />}
                title="No saved portfolios yet"
                description="Generate and save a portfolio to see it here."
                action={{ label: "Create a Portfolio", onClick: () => navigate("/dashboard/portfolio") }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolios.map((portfolio) => (
                  <div key={portfolio.id} className="glass-card p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Layout className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{portfolio.name || "Untitled Portfolio"}</h3>
                          <p className="text-xs text-muted-foreground capitalize">
                            {portfolio.personal?.title || "Portfolio"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          templateBadgeColor[portfolio.template] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {portfolio.template || "default"}
                      </span>
                    </div>

                    {/* Info row */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {portfolio.personal?.email && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {portfolio.personal.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {portfolio.savedAt || "—"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => setPreviewPortfolio(portfolio)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => handleDownloadPortfolio(portfolio)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        disabled={deletingId === portfolio.id}
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === portfolio.id ? "…" : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Portfolio Preview Modal */}
      {previewPortfolio && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPortfolio(null)}
        >
          <div
            className="bg-background rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div>
                <h2 className="font-semibold">{previewPortfolio.name}</h2>
                <p className="text-xs text-muted-foreground capitalize">{previewPortfolio.template} template</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => handleDownloadPortfolio(previewPortfolio)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPreviewPortfolio(null)}>
                  ✕
                </Button>
              </div>
            </div>
            <iframe
              srcDoc={previewPortfolio.html}
              className="flex-1 w-full border-0"
              title="Portfolio Preview"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Button onClick={action.onClick} className="gap-2 mt-1">
        <FolderOpen className="w-4 h-4" />
        {action.label}
      </Button>
    </div>
  );
}
