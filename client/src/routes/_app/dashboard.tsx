import { createFileRoute, Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Send,
  FileText,
  Loader2,
  TrendingUp,
  Calendar,
  Zap,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardQuery } from '@/hooks/useDashboardHooks'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { format } from 'date-fns'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

const chartConfig = {
  scans: {
    label: 'Scans',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

const STATUS_COLORS: Record<string, string> = {
  completed: '#4fb8b2',
  running: '#3b82f6',
  scheduled: '#f59e0b',
  draft: '#94a3b8',
  failed: '#ef4444',
  cancelled: '#64748b',
}

function DashboardPage() {
  const { data, isLoading, error } = useDashboardQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4fb8b2]" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const { stats, analytics, recentActivity } = data

  const statCards = [
    {
      label: 'Total Contacts',
      value: stats.totalContacts,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Campaigns',
      value: stats.totalCampaigns,
      icon: Send,
      color: 'text-[#4fb8b2]',
      bg: 'bg-[#4fb8b2]/10',
    },
    {
      label: 'Templates',
      value: stats.totalTemplates,
      icon: FileText,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Total Reach',
      value: stats.totalReach,
      icon: TrendingUp,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
          Dashboard
        </h1>
        <p className="text-muted-foreground font-sans">
          Welcome back! Here's your networking overview.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className="rounded-2xl border-border shadow-sm bg-card transition-all hover:shadow-md overflow-hidden"
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground font-sans uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-foreground font-sans mt-0.5">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Scans Chart */}
        <Card className="md:col-span-8 rounded-2xl border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Scans Over Time</CardTitle>
            <CardDescription>Activity for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={analytics.scansOverTime}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="_id"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                  {analytics.scansOverTime.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`var(--chart-${(index % 5) + 1})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Campaign Pie Chart */}
        <Card className="md:col-span-4 rounded-2xl border-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Campaign Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.campaignStatus}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {analytics.campaignStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry._id] || '#cbd5e1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {analytics.campaignStatus.map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[entry._id] }}
                  />
                  <span className="capitalize text-muted-foreground">
                    {entry._id}:
                  </span>
                  <span className="font-bold">{entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Campaign Activity */}
        <div className="md:col-span-8 space-y-6">
          <Card className="rounded-2xl border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  Campaign Activity
                </CardTitle>
                <CardDescription>
                  Recently updated outreach efforts
                </CardDescription>
              </div>
              <Link to="/campaigns">
                <Button variant="ghost" size="sm" className="text-[#4fb8b2]">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity.campaigns.map((campaign: any) => (
                  <div
                    key={campaign._id}
                    className="p-4 flex items-center gap-4 hover:bg-accent/40 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Send className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground font-sans">
                        {campaign.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-sans">
                        Status: {campaign.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(campaign.updatedAt), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.campaigns.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No recent campaigns.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-4 space-y-6">
          <Card className="rounded-2xl border-border shadow-sm bg-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link to="/scan">
                <button className="w-full flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#4fb8b2]/20 hover:border-[#4fb8b2] hover:bg-[#4fb8b2]/5 transition-all group">
                  <div className="h-14 w-14 rounded-2xl bg-[#4fb8b2] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#4fb8b2]/20">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-bold text-foreground font-sans">
                    Scan New Card
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instant AI Extraction
                  </p>
                </button>
              </Link>

              <Link to="/campaigns/create">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-border hover:bg-accent text-foreground font-bold"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Campaign
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Contacts - Full Width */}
      <Card className="rounded-2xl border-border shadow-sm bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Recent Contacts</CardTitle>
            <CardDescription>Latest scanned business cards</CardDescription>
          </div>
          <Link to="/contacts">
            <Button variant="ghost" size="sm" className="text-[#4fb8b2]">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentActivity.contacts.map((contact: any) => (
              <div
                key={contact._id}
                className="p-4 flex items-center gap-4 hover:bg-accent/40 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-[#4fb8b2]/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#4fb8b2]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground font-sans">
                    {contact.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans">
                    {contact.company || 'N/A'} • {contact.email || 'No email'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[10px] ${
                      contact.status === 'completed'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-orange-500/10 text-orange-500'
                    }`}
                  >
                    {contact.status}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(new Date(contact.createdAt), 'MMM dd')}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.contacts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No recent contacts.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
