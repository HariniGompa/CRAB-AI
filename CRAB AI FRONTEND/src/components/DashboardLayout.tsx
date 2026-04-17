import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shell, 
  Target, 
  FileSearch, 
  FileEdit, 
  Layout, 
  MessageSquare,
  Lightbulb,
  User,
  HelpCircle,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Home,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
const navItems = [
  { icon: Target, label: "ATS Scoring", path: "/dashboard/ats-scoring" },
  { icon: FileSearch, label: "Resume Matcher", path: "/dashboard/resume-matcher" },
  { icon: FileEdit, label: "Resume Builder", path: "/dashboard/resume-builder" },
  { icon: Layout, label: "Portfolio Generator", path: "/dashboard/portfolio" },
  { icon: Lightbulb, label: "Course Recommendation", path: "/dashboard/skill-recommendation" },
  { icon: MessageSquare, label: "Interview Prep", path: "/dashboard/interview" },
  { icon: Bookmark, label: "Saved Items", path: "/dashboard/saved" },
];

const bottomNavItems = [
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const currentBot = navItems.find(item => location.pathname === item.path);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className={cn(
          "p-4 border-b border-sidebar-border flex items-center",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg primary-gradient flex items-center justify-center flex-shrink-0">
              <Shell className="w-5 h-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-foreground">CRAB AI</span>
            )}
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
              AI Bots
            </p>
          )}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                sidebarCollapsed && "justify-center",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                sidebarCollapsed && "justify-center",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Log out" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full",
              sidebarCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Log out</span>}
          </button>
        </div>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-muted transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top header */}
        <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Breadcrumb navigation */}
            <nav className="flex items-center gap-2 text-sm">
              <Link 
                to="/dashboard" 
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              {currentBot && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <span className="font-medium text-foreground">{currentBot.label}</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;