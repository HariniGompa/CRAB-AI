import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shell, Mail, Lock, Eye, EyeOff, CheckCircle, Target, FileEdit, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Step = "credentials" | "success";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message || "Failed to sign in");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
    setStep("success");
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Visual Area - 2/3 */}
      <div className="hidden lg:flex lg:w-2/3 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        {/* Subtle animated elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="max-w-lg text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                <Shell className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold">CRAB AI</span>
            </div>
            
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Your Career Assistant, Powered by AI
            </h2>
            <p className="text-muted-foreground mb-12">
              Build ATS-optimized resumes, prepare for interviews, and land your dream job.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 border border-border/50">
                <Target className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium">ATS Scoring</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 border border-border/50">
                <FileEdit className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium">Resume Builder</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background/50 border border-border/50">
                <Sparkles className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium">Interview Prep</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Area - 1/3 */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CRAB AI</span>
          </div>

          {/* Auth type toggle */}
          <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-lg mb-8">
            <div className="flex-1 py-2 px-4 text-center font-medium bg-background rounded-md shadow-sm">
              Sign In
            </div>
            <Link 
              to="/signup" 
              className="flex-1 py-2 px-4 text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-10 h-1 rounded-full transition-colors ${["credentials", "success"].includes(step) ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-10 h-1 rounded-full transition-colors ${step === "success" ? "bg-primary" : "bg-muted"}`} />
          </div>

          {step === "credentials" && (
            <>
              <h1 className="text-2xl font-bold text-center mb-1">Welcome back</h1>
              <p className="text-muted-foreground text-center mb-6 text-sm">
                Sign in to your account
              </p>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold mb-2">Welcome back!</h1>
              <p className="text-muted-foreground mb-6 text-sm">
                You've successfully signed in to your account.
              </p>
              <Button 
                className="w-full h-11"
                onClick={handleContinue}
              >
                Continue to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
