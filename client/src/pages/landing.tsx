import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BarChart3, Zap, ArrowRight, Phone, Target } from "lucide-react";
import logoPath from "@assets/logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Canvas Cartel" className="h-8 w-auto" />
          </div>
          <a href="/api/login" data-testid="button-login-nav">
            <Button variant="default" className="bg-[#EE2B2B] hover:bg-[#d42525] text-white">
              Sign In
            </Button>
          </a>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">
              Manage Your <span className="text-[#EE2B2B]">Creative</span> Business Smarter
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Canvas Cartel CRM helps you track leads, manage your sales pipeline, and grow your creative agency — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/api/login" data-testid="button-get-started">
                <Button size="lg" className="bg-[#EE2B2B] hover:bg-[#d42525] text-white gap-2 w-full sm:w-auto">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                No credit card required
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#EE2B2B]/20 to-transparent rounded-2xl blur-3xl" />
              <div className="relative bg-card border rounded-2xl p-8 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Sales Pipeline</h3>
                    <span className="text-xs text-muted-foreground">This week</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-[#EE2B2B]">24</p>
                      <p className="text-xs text-muted-foreground">New Leads</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-[#EE2B2B]">12</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-[#EE2B2B]">8</p>
                      <p className="text-xs text-muted-foreground">Won</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {["Website Redesign", "Social Media Campaign", "Brand Identity"].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-[#EE2B2B]" />
                        <span className="text-sm">{item}</span>
                        <span className="ml-auto text-xs text-muted-foreground">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-center mb-12">
            Everything You Need to Grow
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card hover:bg-card/80 transition-colors border">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EE2B2B]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#EE2B2B]" />
                </div>
                <h3 className="font-semibold">Lead Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track and nurture every lead with detailed profiles, call logs, quality scoring, and service interest tracking.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card hover:bg-card/80 transition-colors border">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EE2B2B]/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#EE2B2B]" />
                </div>
                <h3 className="font-semibold">Sales Pipeline</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your deals with a drag-and-drop Kanban board. Move leads through stages effortlessly.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card hover:bg-card/80 transition-colors border">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#EE2B2B]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#EE2B2B]" />
                </div>
                <h3 className="font-semibold">n8n Automation</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with n8n webhooks to automatically capture leads from your website, ads, and forms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Canvas Cartel. All rights reserved.</p>
          <p>canvascartel.in</p>
        </div>
      </footer>
    </div>
  );
}
