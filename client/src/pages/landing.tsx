import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Lock, Loader2 } from "lucide-react";
import logoPath from "@assets/logo.png";

export default function Landing() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#EE2B2B]">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 600 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="150" cy="200" r="300" fill="rgba(255,255,255,0.08)" />
          <circle cx="500" cy="700" r="250" fill="rgba(255,255,255,0.05)" />
          <circle cx="100" cy="600" r="150" fill="rgba(255,255,255,0.06)" />
          <ellipse cx="400" cy="300" rx="200" ry="300" fill="rgba(255,255,255,0.04)" />
        </svg>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <img src={logoPath} alt="Canvas Cartel" className="h-12 w-auto brightness-0 invert" />
          </div>
          <h1 className="text-4xl font-bold mb-2">C.R.M</h1>
          <p className="text-lg font-medium mb-4 opacity-90">Customer Relationship Management</p>
          <p className="text-sm opacity-70 max-w-sm leading-relaxed">
            Manage your leads, track deals, log calls, and grow your creative business — all from one powerful dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <img src={logoPath} alt="Canvas Cartel" className="h-10 w-auto" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold" data-testid="text-login-title">
              Sign In to <span className="text-[#EE2B2B]">C.R.M</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(error || loginError) && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3" data-testid="text-login-error">
                {error || loginError?.message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold bg-[#EE2B2B] hover:bg-[#d42525] text-white tracking-wide"
              data-testid="button-login"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "LOG IN"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-4">
            &copy; {new Date().getFullYear()} Canvas Cartel &middot; canvascartel.in
          </p>
        </div>
      </div>
    </div>
  );
}
