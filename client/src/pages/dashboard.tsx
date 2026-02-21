import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  DollarSign,
  TrendingUp,
  Phone,
  CheckSquare,
  Kanban,
} from "lucide-react";
import type { Lead, Deal, CallLog, Task, Activity } from "@shared/schema";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  testId,
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`${testId}-value`}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });
  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });
  const { data: callLogs, isLoading: callsLoading } = useQuery<CallLog[]>({
    queryKey: ["/api/call-logs"],
  });
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const isLoading = leadsLoading || dealsLoading || callsLoading || tasksLoading;

  const totalLeads = leads?.length || 0;
  const totalDeals = deals?.length || 0;
  const totalRevenue = deals
    ?.filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + (d.value || 0), 0) || 0;
  const pendingTasks = tasks?.filter((t) => t.status === "pending").length || 0;
  const recentCalls = callLogs?.length || 0;
  const newLeads = leads?.filter((l) => l.status === "new").length || 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Canvas Cartel CRM Overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          description={`${newLeads} new leads`}
          testId="stat-total-leads"
        />
        <StatCard
          title="Active Deals"
          value={totalDeals}
          icon={Kanban}
          description="In pipeline"
          testId="stat-active-deals"
        />
        <StatCard
          title="Revenue Won"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={DollarSign}
          description="From closed deals"
          testId="stat-revenue"
        />
        <StatCard
          title="Call Logs"
          value={recentCalls}
          icon={Phone}
          description="Total calls logged"
          testId="stat-calls"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={CheckSquare}
          description="Needs attention"
          testId="stat-tasks"
        />
        <StatCard
          title="Conversion Rate"
          value={
            totalLeads > 0
              ? `${Math.round(
                  ((deals?.filter((d) => d.stage === "won").length || 0) /
                    totalLeads) *
                    100
                )}%`
              : "0%"
          }
          icon={TrendingUp}
          description="Lead to deal"
          testId="stat-conversion"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {leads && leads.length > 0 ? (
              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between gap-2"
                    data-testid={`lead-row-${lead.id}`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{lead.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {lead.company || lead.email || "No details"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        lead.status === "new"
                          ? "default"
                          : lead.status === "contacted"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No leads yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3"
                    data-testid={`activity-row-${activity.id}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.createdAt
                          ? new Date(activity.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Services Offered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "Advertisement Design", price: "₹15,000" },
              { name: "Social Media Content", price: "₹20,000" },
              { name: "Website Development", price: "₹50,000" },
              { name: "Video Production", price: "₹25,000" },
              { name: "Photo Production", price: "₹15,000" },
              { name: "Marketing Strategy", price: "₹35,000" },
              { name: "n8n Automation", price: "₹30,000" },
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50"
              >
                <span className="text-sm font-medium truncate">{service.name}</span>
                <Badge variant="outline" className="shrink-0">{service.price}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
