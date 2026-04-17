import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, FileText, Edit2, Save, Loader2, Shield, Star, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const getToken = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ resumes: 0, portfolios: 0 });
  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";
      setDisplayName(name);
      setOriginalName(name);
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/profile/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats({ resumes: data.resumes || 0, portfolios: data.portfolios || 0 });
      }
    } catch {}
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (error) throw error;
      setOriginalName(displayName);
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently";

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>

        {/* Avatar + basic info */}
        <div className="glass-card p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="text-lg font-semibold h-9 max-w-xs"
                      placeholder="Your name"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setDisplayName(originalName); setIsEditing(false); }}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold truncate">{displayName}</h2>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="flex-shrink-0">
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Member since {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Resumes Created", value: stats.resumes, icon: FileText, color: "text-blue-500" },
            { label: "Portfolios Built", value: stats.portfolios, icon: Star, color: "text-amber-500" },
            { label: "AI Features Used", value: "All", icon: Shield, color: "text-green-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-5 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Account Details</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</Label>
              <p className="mt-1 text-sm font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Account ID</Label>
              <p className="mt-1 text-xs font-mono text-muted-foreground">{user.id?.slice(0, 8)}...{user.id?.slice(-8)}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Auth Provider</Label>
              <p className="mt-1 text-sm font-medium capitalize">{user.app_metadata?.provider || "email"}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Available Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Resume Builder", "Create ATS-optimized resumes with 4 templates"],
              ["Portfolio Generator", "Build portfolio websites with 12 themes"],
              ["ATS Scoring", "AI-powered resume analysis & feedback"],
              ["Resume Matcher", "Match resume to any job description"],
              ["Interview Prep", "Practice with AI interview coach"],
              ["Course Recommendations", "Get personalized learning paths"],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-2">Account Actions</h3>
          <p className="text-sm text-muted-foreground mb-4">Sign out of your CRAB AI account on this device.</p>
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
