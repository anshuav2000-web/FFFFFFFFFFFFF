import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Zap, ArrowRight, Phone, Target } from "lucide-react";
import logoPath from "@assets/logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Canvas Cartel" className="h-8 w-auto" />
          </div>
          <a href="/api/login" data-testid="button-login-nav">
            <Button variant="outline" size="sm">Log In</Button>
          </a>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-tight">
                Manage Your <span className="text-[#EE2B2B]">Creative</span> Business
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                The all-in-one CRM built for Canvas Cartel. Track leads, manage deals, log calls, and automate your workflow — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/api/login" data-testid="button-get-started">
                  <Button size="lg" className="bg-[#EE2B2B] hover:bg-[#d42525] text-white gap-2 w-full sm:w-auto">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Secure login
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Team access
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EE2B2B]/20 to-transparent rounded-2xl" />
                <div className="bg-card border rounded-2xl p-8 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-[#EE2B2B]" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-xs text-muted-foreground">Active Leads</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-[#EE2B2B]">₹12L</p>
                      <p className="text-xs text-muted-foreground">Pipeline</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">89%</p>
                      <p className="text-xs text-muted-foreground">Follow-up</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {["Website Development", "Social Media Marketing", "n8n Automation"].map((s) => (
                      <div key={s} className="flex items-center justify-between bg-muted/50 rounded-md p-2.5">
                        <span className="text-sm">{s}</span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[#EE2B2B] rounded-full" style={{ width: `${Math.random() * 40 + 50}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-center mb-12">Everything you need to grow</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Lead Management", desc: "Track every lead with 19+ fields. Score quality, log outcomes, and never lose a prospect." },
              { icon: Target, title: "Sales Pipeline", desc: "Drag-and-drop Kanban board to move deals through stages. Visualize your revenue flow." },
              { icon: Phone, title: "Call Tracking", desc: "Log every call with outcomes like Interested, Call Later, or Schedule. Stay on top of follow-ups." },
              { icon: BarChart3, title: "Dashboard Analytics", desc: "Real-time stats on leads, deals, and performance. Know where your business stands." },
              { icon: Zap, title: "n8n Automation", desc: "Webhook integration to auto-create leads from forms, ads, and external tools." },
              { icon: Users, title: "Contact Book", desc: "Organize client contacts with company info, services, and communication history." },
            ].map((feature) => (
              <Card key={feature.title} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EE2B2B]/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-[#EE2B2B]" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoPath} alt="Canvas Cartel" className="h-6 w-auto" />
            <span className="text-sm text-muted-foreground">canvascartel.in</span>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Canvas Cartel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
