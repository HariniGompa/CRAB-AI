import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shell, Mail, Lock, Eye, EyeOff, CheckCircle, User, Target, FileEdit, Sparkles, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Step = "credentials" | "success";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();
  const [step, setStep] = useState<Step>("credentials");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordValid = password.length >= 8;

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !passwordValid) return;
    setIsLoading(true);
    
    const { error } = await signUp(email, password, name);
    
    if (error) {
      toast.error(error.message || "Failed to create account");
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
            <Link 
              to="/login" 
              className="flex-1 py-2 px-4 text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <div className="flex-1 py-2 px-4 text-center font-medium bg-background rounded-md shadow-sm">
              Sign Up
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-10 h-1 rounded-full transition-colors ${["credentials", "success"].includes(step) ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-10 h-1 rounded-full transition-colors ${step === "success" ? "bg-primary" : "bg-muted"}`} />
          </div>

          {step === "credentials" && (
            <>
              <h1 className="text-2xl font-bold text-center mb-1">Create an account</h1>
              <p className="text-muted-foreground text-center mb-6 text-sm">
                Get started with CRAB AI
              </p>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password">Password</Label>
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
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>

              <p className="text-center text-xs text-muted-foreground mt-4">
                By signing up, you agree to our{" "}
                <button 
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </button>
                {" "}and{" "}
                <button 
                  type="button"
                  onClick={() => setPrivacyOpen(true)}
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold mb-2">Account created!</h1>
              <p className="text-muted-foreground mb-6 text-sm">
                Welcome to CRAB AI, {name}. Your account has been successfully created.
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

      {/* Terms of Service Modal */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-muted-foreground">Last updated: December 2024</p>
            <h3 className="text-lg font-semibold mt-4">1. Acceptance of Terms</h3>
            <p className="text-sm text-muted-foreground">
              By accessing and using CRAB AI, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <h3 className="text-lg font-semibold mt-4">2. Use License</h3>
            <p className="text-sm text-muted-foreground">
              Permission is granted to temporarily use CRAB AI for personal, non-commercial purposes. This is the grant of a license, not a transfer of title.
            </p>
            <h3 className="text-lg font-semibold mt-4">3. Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              The materials on CRAB AI are provided on an 'as is' basis. CRAB AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
            </p>
            <h3 className="text-lg font-semibold mt-4">4. Limitations</h3>
            <p className="text-sm text-muted-foreground">
              In no event shall CRAB AI or its suppliers be liable for any damages arising out of the use or inability to use the materials on CRAB AI.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-muted-foreground">Last updated: December 2024</p>
            <h3 className="text-lg font-semibold mt-4">1. Information We Collect</h3>
            <p className="text-sm text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account, upload a resume, or contact us for support.
            </p>
            <h3 className="text-lg font-semibold mt-4">2. How We Use Your Information</h3>
            <p className="text-sm text-muted-foreground">
              We use the information we collect to provide, maintain, and improve our services, and to communicate with you.
            </p>
            <h3 className="text-lg font-semibold mt-4">3. Data Security</h3>
            <p className="text-sm text-muted-foreground">
              We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
            </p>
            <h3 className="text-lg font-semibold mt-4">4. Data Retention</h3>
            <p className="text-sm text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
