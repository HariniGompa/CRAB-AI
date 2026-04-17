import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Target, 
  FileSearch, 
  FileEdit, 
  Layout, 
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const bots = [
  {
    icon: Target,
    title: "ATS Scoring",
    description: "Score your resume against ATS systems and get detailed feedback on keywords and formatting.",
    path: "/dashboard/ats-scoring",
  },
  {
    icon: FileSearch,
    title: "Resume Matcher",
    description: "Match your resume to specific job descriptions and get skill recommendations.",
    path: "/dashboard/resume-matcher",
  },
  {
    icon: FileEdit,
    title: "Resume Builder",
    description: "Create professional resumes with our intelligent form builder. Export to PDF or DOC.",
    path: "/dashboard/resume-builder",
  },
  {
    icon: Layout,
    title: "Portfolio Generator",
    description: "Generate beautiful HTML portfolios to showcase your work and projects.",
    path: "/dashboard/portfolio",
  },
  {
    icon: Lightbulb,
    title: "Skill Recommendation",
    description: "Get personalized skill recommendations based on your career goals and market trends.",
    path: "/dashboard/skill-recommendation",
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description: "Practice with an AI-powered chatbot to prepare for your upcoming interviews.",
    path: "/dashboard/interview",
  },
  {
    icon: Bookmark,
    title: "Saved Items",
    description: "View and manage all your saved resumes and portfolios in one place.",
    path: "/dashboard/saved",
  },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Welcome back!</h1>
          <p className="text-muted-foreground">
            Select a tool below to get started with your career enhancement journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot, index) => (
            <div 
              key={bot.title}
              className="glass-card p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 animate-fade-up group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <bot.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1.5">{bot.title}</h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{bot.description}</p>
              <Button variant="outline" asChild className="w-full group-hover:border-primary/50 group-hover:bg-primary/5">
                <Link to={bot.path}>
                  Open Tool
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;