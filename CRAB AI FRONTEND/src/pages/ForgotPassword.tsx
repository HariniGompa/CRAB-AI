import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shell, Mail, CheckCircle, Target, FileEdit, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "email" | "success";

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
              Reset Your Password
            </h2>
            <p className="text-muted-foreground mb-12">
              Don't worry, it happens to the best of us. We'll help you get back in.
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

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-8 h-1 rounded-full transition-colors ${step === "email" || step === "success" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-8 h-1 rounded-full transition-colors ${step === "success" ? "bg-primary" : "bg-muted"}`} />
          </div>

          {step === "email" && (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-center mb-1">Forgot password?</h1>
              <p className="text-muted-foreground text-center mb-6 text-sm">
                No worries, we'll send you a reset link.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
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

                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link to="/login" className="text-primary hover:underline font-medium">
                  ← Back to Sign In
                </Link>
              </p>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold mb-2">Check your email</h1>
              <p className="text-muted-foreground mb-6 text-sm">
                We sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Click the link in the email to reset your password.
              </p>
              <Button 
                className="w-full h-11"
                asChild
              >
                <Link to="/login">Back to Sign In</Link>
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Didn't receive the email?{" "}
                <button 
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-primary hover:underline font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
