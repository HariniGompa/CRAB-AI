import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shell, Lock, Eye, EyeOff, CheckCircle, Target, FileEdit, Sparkles, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "reset" | "success";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("reset");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordValid = password.length >= 8;

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        toast.error("Invalid or expired reset link. Please request a new one.");
        navigate("/forgot-password");
      }
      setCheckingSession(false);
    };
    
    checkSession();
  }, [navigate]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !passwordValid) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      setStep("success");
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return null;
  }

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
              Set New Password
            </h2>
            <p className="text-muted-foreground mb-12">
              Create a strong password to secure your account.
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

          {step === "reset" && (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-center mb-1">Set new password</h1>
              <p className="text-muted-foreground text-center mb-6 text-sm">
                Must be at least 8 characters.
              </p>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
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
                  {password.length > 0 && (
                    <p className={`text-xs flex items-center gap-1 ${passwordValid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                      {passwordValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      At least 8 characters
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading || !passwordsMatch || !passwordValid}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold mb-2">Password reset!</h1>
              <p className="text-muted-foreground mb-6 text-sm">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Button 
                className="w-full h-11"
                asChild
              >
                <Link to="/login">Back to Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
