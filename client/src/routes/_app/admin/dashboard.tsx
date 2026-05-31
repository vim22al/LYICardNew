import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useQueries } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import {
  Users,
  UserPlus,
  CreditCard,
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Loader2,
  RefreshCcw,
  LayoutDashboard,
  ShieldCheck,
  BarChart3,
  Server,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { format } from 'date-fns'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_app/admin/dashboard')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user?.userType !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminDashboardPage,
})

const PLAN_COLORS: Record<string, string> = {
  free: 'hsl(var(--muted-foreground))',
  pro: 'hsl(var(--primary))',
  max: '#f59e0b',
}

function AdminDashboardPage() {
  const token = useAuthStore((state) => state.token)

  const results = useQueries({
    queries: [
      { queryKey: ['admin-stats'], queryFn: () => adminApi.getStats(token!) },
      { queryKey: ['admin-charts'], queryFn: () => adminApi.getCharts(token!) },
      { queryKey: ['admin-health'], queryFn: () => adminApi.getHealth(token!) },
      {
        queryKey: ['admin-activity'],
        queryFn: () => adminApi.getActivity(token!),
      },
      {
        queryKey: ['admin-top-users'],
        queryFn: () => adminApi.getTopUsers(token!),
      },
    ],
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const [stats, charts, health, activity, topUsers] = results.map((r) => r.data)

  if (isLoading || !stats || !charts || !health || !activity || !topUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Aggregating system metrics...
        </p>
      </div>
    )
  }

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: `+${stats.newUsers.last7Days} this week`,
    },
    {
      label: 'Monthly Active',
      value: stats.activeUsers.monthly,
      icon: Activity,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: `${((stats.activeUsers.monthly / stats.totalUsers) * 100).toFixed(1)}% of total`,
    },
    {
      label: 'Cards Processed',
      value: stats.totalCardsProcessed,
      icon: CreditCard,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      trend: `${stats.totalContactsExtracted} contacts`,
    },
    {
      label: 'Success Rate',
      value: `${stats.extractionSuccessRate}%`,
      icon: Zap,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      trend: `${stats.extractionFailureRate}% failure`,
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground font-sans">
              Admin Console
            </h1>
          </div>
          <p className="text-muted-foreground font-sans">
            Real-time system health and business growth analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button
            size="sm"
            className="bg-[#4fb8b2] hover:bg-[#3da6a0] text-white font-bold shadow-lg shadow-[#4fb8b2]/20"
          >
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl border-border shadow-sm bg-card/50 backdrop-blur-sm transition-all hover:shadow-md hover:bg-card overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-mono text-[10px] uppercase tracking-tighter bg-muted/50"
                  >
                    Live
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground font-sans uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-foreground font-sans">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    {stat.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Server className="h-4 w-4 mr-2" />
            System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            {/* Growth Chart */}
            <Card className="md:col-span-8 rounded-2xl border-border shadow-sm overflow-hidden bg-card/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">
                      User & Activity Growth
                    </CardTitle>
                    <CardDescription>
                      Daily registrations and card uploads (Last 30 days)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] w-full px-4 pb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={charts.userGrowth.map((u: any, i: number) => ({
                        date: u._id,
                        users: u.count,
                        uploads: charts.cardUploads[i]?.count || 0,
                      }))}
                    >
                      <defs>
                        <linearGradient
                          id="colorUsers"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorUploads"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                        style={{ fontSize: '10px' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        style={{ fontSize: '10px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderRadius: '12px',
                          border: '1px solid hsl(var(--border))',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        strokeWidth={3}
                        name="New Users"
                      />
                      <Area
                        type="monotone"
                        dataKey="uploads"
                        stroke="#f59e0b"
                        fillOpacity={1}
                        fill="url(#colorUploads)"
                        strokeWidth={3}
                        name="Card Uploads"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Plan Distribution */}
            <Card className="md:col-span-4 rounded-2xl border-border shadow-sm overflow-hidden bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Plan Distribution
                </CardTitle>
                <CardDescription>
                  User base by subscription type
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.planDistribution}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                      >
                        {stats.planDistribution.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PLAN_COLORS[entry._id] || '#cbd5e1'}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-3 mt-4">
                  {stats.planDistribution.map((entry: any) => (
                    <div
                      key={entry._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PLAN_COLORS[entry._id] }}
                        />
                        <span className="text-sm font-bold capitalize">
                          {entry._id} Plan
                        </span>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {entry.count} users
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            {/* Activity Feed */}
            <Card className="md:col-span-7 rounded-2xl border-border shadow-sm bg-card/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <CardTitle className="text-lg font-bold">
                    System Activity
                  </CardTitle>
                  <CardDescription>
                    Live feed of events and actions
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary font-bold"
                >
                  Full Logs
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                  {activity.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 flex items-start gap-4 hover:bg-accent/40 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-1 ${
                          item.type === 'USER_REGISTRATION'
                            ? 'bg-blue-500/10'
                            : 'bg-orange-500/10'
                        }`}
                      >
                        {item.type === 'USER_REGISTRATION' ? (
                          <UserPlus className={`h-4 w-4 text-blue-500`} />
                        ) : (
                          <CreditCard className={`h-4 w-4 text-orange-500`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {item.type === 'USER_REGISTRATION'
                            ? `New User: ${item.data.name}`
                            : `Card Scanned: ${item.data.name}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.type === 'USER_REGISTRATION'
                            ? item.data.email
                            : `Status: ${item.data.status} • By ${item.data.userId?.name || 'Unknown'}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-mono text-muted-foreground">
                          {format(new Date(item.timestamp), 'HH:mm:ss')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(item.timestamp), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="md:col-span-5 rounded-2xl border-border shadow-sm bg-card/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Quick Actions
                </CardTitle>
                <CardDescription>Administrative shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 rounded-xl"
                  asChild
                >
                  <Link to="/admin/users">
                    <Users className="h-4 w-4 mr-3 text-blue-500" />
                    Manage All Users
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 rounded-xl"
                  asChild
                >
                  <Link to="/admin/plans">
                    <CreditCard className="h-4 w-4 mr-3 text-purple-500" />
                    Subscription Plans
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 rounded-xl"
                >
                  <AlertTriangle className="h-4 w-4 mr-3 text-orange-500" />
                  View Failed Jobs
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 rounded-xl"
                >
                  <RefreshCcw className="h-4 w-4 mr-3 text-[#4fb8b2]" />
                  Reprocess Queue
                </Button>
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">
                    System Broadcast
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Send a notification to all active users across the platform.
                  </p>
                  <Button className="w-full bg-primary text-primary-foreground font-bold h-9">
                    Create Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="rounded-2xl border-border shadow-sm bg-card/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Top Users by Activity
              </CardTitle>
              <CardDescription>
                Most active users based on business card scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[250px] font-bold">User</TableHead>
                    <TableHead className="font-bold">Plan</TableHead>
                    <TableHead className="font-bold">Total Scans</TableHead>
                    <TableHead className="font-bold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topUsers.map((user: any) => (
                    <TableRow
                      key={user._id}
                      className="hover:bg-accent/40 border-border/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`capitalize font-bold ${
                            user.subscriptionType === 'max'
                              ? 'text-amber-500 bg-amber-500/10'
                              : user.subscriptionType === 'pro'
                                ? 'text-primary bg-primary/10'
                                : ''
                          }`}
                        >
                          {user.subscriptionType} ({user.plan || 'N/A'})
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 max-w-[100px] bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#4fb8b2]"
                              style={{
                                width: `${Math.min((user.scanCount / 50) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono font-bold">
                            {user.scanCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-bold text-primary"
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* BullMQ Health */}
            <Card className="rounded-2xl border-border shadow-sm bg-card/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      BullMQ Statistics
                    </CardTitle>
                    <CardDescription>
                      Campaign and email processing queues
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  Operational
                </Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {Object.entries(health.queues.bullmq).map(
                  ([name, counts]: [string, any]) => (
                    <div key={name} className="space-y-3">
                      <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                        {name} Queue
                        <span className="text-[10px] font-mono lowercase text-muted-foreground/60 tracking-normal">
                          redis backend
                        </span>
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          {
                            label: 'Wait',
                            val: counts.waiting,
                            color: 'text-blue-500',
                            bg: 'bg-blue-500/10',
                          },
                          {
                            label: 'Active',
                            val: counts.active,
                            color: 'text-emerald-500',
                            bg: 'bg-emerald-500/10',
                          },
                          {
                            label: 'Failed',
                            val: counts.failed,
                            color: 'text-destructive',
                            bg: 'bg-destructive/10',
                          },
                          {
                            label: 'Completed',
                            val: counts.completed,
                            color: 'text-muted-foreground',
                            bg: 'bg-muted/50',
                          },
                        ].map((q, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl ${q.bg} text-center`}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
                              {q.label}
                            </p>
                            <p className={`text-xl font-black ${q.color}`}>
                              {q.val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* RabbitMQ Health */}
            <Card className="rounded-2xl border-border shadow-sm bg-card/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      RabbitMQ Status
                    </CardTitle>
                    <CardDescription>
                      Business card extraction pipeline
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Active
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-card shadow-sm border border-border/50">
                        <Clock className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Pending Extractions
                        </p>
                        <p className="text-3xl font-black text-foreground">
                          {health.queues.rabbitmq.messageCount}
                        </p>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full border-4 border-muted border-t-orange-500 animate-spin" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Active Workers
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-foreground">
                          {health.queues.rabbitmq.consumerCount}
                        </p>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none h-5">
                          Online
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Success Rate
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-foreground">
                          {stats.extractionSuccessRate}%
                        </p>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-destructive">
                          Extraction Failures
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          System detected {stats.extractionFailureRate}% failure
                          rate in the last 24 hours. Consider reviewing AI
                          extraction prompts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
