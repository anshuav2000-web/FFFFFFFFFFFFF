import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import logoPath from "@assets/logo.png";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-settings-title">Settings</h1>
        <p className="text-muted-foreground">CRM configuration and information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img src={logoPath} alt="Canvas Cartel" className="h-12 w-auto" />
            <div>
              <h3 className="font-bold text-lg">Canvas Cartel</h3>
              <p className="text-sm text-muted-foreground">Creative Design & Marketing Studio</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Website</p>
              <a
                href="https://canvascartel.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium flex items-center gap-1"
                data-testid="link-website"
              >
                canvascartel.in
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="text-sm font-medium">Creative Marketing Agency</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-sm font-medium">India</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="text-sm font-medium">5+ Years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Services & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Advertisement Design", desc: "Eye-catching ads for print & digital", price: "From ₹15,000" },
              { name: "Social Media Content", desc: "Strategic content that connects", price: "From ₹20,000" },
              { name: "Website Development", desc: "Fast, responsive, conversion-focused", price: "From ₹50,000" },
              { name: "Video Production", desc: "Compelling brand storytelling", price: "From ₹25,000" },
              { name: "Photo Production", desc: "Professional brand photography", price: "From ₹15,000" },
              { name: "Marketing Strategy", desc: "Complete roadmaps for growth", price: "From ₹35,000" },
              { name: "n8n Automation", desc: "Workflow & business automation", price: "From ₹30,000" },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.desc}</p>
                </div>
                <Badge variant="outline">{service.price}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CRM Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="text-sm font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="text-sm font-medium">Canvas Cartel CRM</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Features</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {["Leads", "Contacts", "Pipeline", "Call Logs", "Tasks", "Webhooks"].map((f) => (
                  <Badge key={f} variant="secondary">{f}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Integrations</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="secondary">n8n</Badge>
                <Badge variant="secondary">Webhook API</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
