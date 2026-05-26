import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import {
  Users,
  UserPlus,
  Activity,
  TrendingUp,
  UserCheck,
  UserMinus,
  Loader2,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
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
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  Cell,
} from 'recharts'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_app/admin/analytics/users')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user?.userType !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminAnalyticsUsersPage,
})

function AdminAnalyticsUsersPage() {
  const token = useAuthStore((state) => state.token)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-user-analytics'],
    queryFn: () => adminApi.getUserAnalytics(token!),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Analyzing user growth trends...
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <p className="text-destructive font-medium">
          Failed to load user analytics.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    )
  }

  const { metrics, charts } = data

  const kpiCards = [
    {
      label: 'Total Users',
      value: metrics.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: `${metrics.growthRate} growth`,
      isPositive: true,
    },
    {
      label: 'Daily Active (DAU)',
      value: metrics.activeUsers.dau,
      icon: Activity,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: `${((metrics.activeUsers.dau / metrics.totalUsers) * 100).toFixed(1)}% stickiness`,
      isPositive: true,
    },
    {
      label: 'Retention Rate',
      value: metrics.retentionRate,
      icon: UserCheck,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: 'Last 30 days',
      isPositive: true,
    },
    {
      label: 'Churn Rate',
      value: metrics.churnRate,
      icon: UserMinus,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      trend: 'Calculated monthly',
      isPositive: false,
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
          <h1 className="text-3xl font-black tracking-tight text-foreground font-sans">
            User Analytics
          </h1>
          <p className="text-muted-foreground font-sans">
            Deep dive into user growth, engagement, and retention.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
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
            <Card className="rounded-2xl border-border shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-tighter"
                  >
                    Real-time
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
                    {stat.isPositive ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-rose-500" />
                    )}
                    {stat.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Growth Chart */}
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">User Growth</CardTitle>
            <CardDescription>
              New user registrations over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] w-full px-4 pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.growth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
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
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="_id"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="New Users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Distribution */}
        <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Active Users (DAU vs WAU vs MAU)
            </CardTitle>
            <CardDescription>
              User activity levels across different time periods
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'DAU',
                      value: metrics.activeUsers.dau,
                      color: 'hsl(var(--primary))',
                    },
                    {
                      name: 'WAU',
                      value: metrics.activeUsers.wau,
                      color: 'hsl(var(--primary)/0.7)',
                    },
                    {
                      name: 'MAU',
                      value: metrics.activeUsers.mau,
                      color: 'hsl(var(--primary)/0.4)',
                    },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {[
                      {
                        name: 'DAU',
                        value: metrics.activeUsers.dau,
                        color: 'hsl(var(--primary))',
                      },
                      {
                        name: 'WAU',
                        value: metrics.activeUsers.wau,
                        color: 'hsl(var(--primary)/0.7)',
                      },
                      {
                        name: 'MAU',
                        value: metrics.activeUsers.mau,
                        color: 'hsl(var(--primary)/0.4)',
                      },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  DAU/MAU
                </p>
                <p className="text-xl font-black">
                  {(
                    (metrics.activeUsers.dau / metrics.activeUsers.mau) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  WAU/MAU
                </p>
                <p className="text-xl font-black">
                  {(
                    (metrics.activeUsers.wau / metrics.activeUsers.mau) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  New Users
                </p>
                <p className="text-xl font-black">
                  +{metrics.newUsers.last30Days}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
