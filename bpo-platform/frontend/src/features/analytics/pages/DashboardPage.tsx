import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Building,
  ClipboardList,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { analyticsService } from '@/services/analyticsService';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsService.getDashboardStats,
  });

  const { data: taskTrends } = useQuery({
    queryKey: ['task-trends'],
    queryFn: () => analyticsService.getTaskTrends(30),
  });

  const { data: workflowTrends } = useQuery({
    queryKey: ['workflow-trends'],
    queryFn: () => analyticsService.getWorkflowTrends(30),
  });

  const { data: slaSummary } = useQuery({
    queryKey: ['sla-summary'],
    queryFn: () => analyticsService.getSLASummary(30),
  });

  const statCards = [
    {
      name: 'Active Users',
      value: stats?.active_users ?? 0,
      total: stats?.total_users ?? 0,
      icon: Users,
    },
    {
      name: 'Departments',
      value: stats?.total_departments ?? 0,
      icon: Building,
    },
    {
      name: 'Active Workflows',
      value: stats?.active_workflows ?? 0,
      icon: ClipboardList,
    },
    {
      name: 'Completed Today',
      value: stats?.completed_tasks_today ?? 0,
      icon: CheckCircle,
    },
    {
      name: 'Pending Tasks',
      value: stats?.pending_tasks ?? 0,
      icon: Clock,
    },
    {
      name: 'SLA Breached',
      value: stats?.sla_breached_count ?? 0,
      icon: AlertTriangle,
    },
  ];

  const slaData = slaSummary
    ? [
        { name: 'Compliant', value: slaSummary.compliant_tasks },
        { name: 'Breached', value: slaSummary.breached_tasks },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your BPO operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '-' : stat.value}
                {stat.total && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{stat.total}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="Completed Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workflow Creation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Instances</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workflowTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="New Instances"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center">
            {slaSummary ? (
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={slaData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--destructive))" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {slaSummary.compliance_rate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Compliance</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Loading...</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">Breached</span>
            </div>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/my-tasks"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">View My Tasks</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.in_progress_tasks ?? 0} tasks in progress
                  </p>
                </div>
              </a>
              <a
                href="/workflow-instances"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Active Workflows
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.active_workflows ?? 0} workflows running
                  </p>
                </div>
              </a>
              <a
                href="/users"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.total_users ?? 0} total users
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Processes</span>
                <span className="text-xl font-semibold">
                  {stats?.total_processes ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">In Progress Tasks</span>
                <span className="text-xl font-semibold">
                  {stats?.in_progress_tasks ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Tasks</span>
                <span className="text-xl font-semibold">
                  {stats?.pending_tasks ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed Today</span>
                <span className="text-xl font-semibold text-green-600">
                  {stats?.completed_tasks_today ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
