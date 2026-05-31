import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  PieChart as PieChartIcon,
  Loader2,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { motion } from 'motion/react'

export const Route = createFileRoute('/_app/admin/analytics/revenue')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user?.userType !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminAnalyticsRevenuePage,
})

const REVENUE_COLORS = ['#4fb8b2', '#f59e0b', '#3b82f6', '#8b5cf6']

function AdminAnalyticsRevenuePage() {
  const token = useAuthStore((state) => state.token)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-revenue-analytics'],
    queryFn: () => adminApi.getRevenueAnalytics(token!),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Calculating financial metrics...
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <p className="text-destructive font-medium">
          Failed to load revenue analytics.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    )
  }

  const { metrics, charts } = data

  const kpiCards = [
    {
      label: 'Monthly Recurring (MRR)',
      value: `₹${metrics.mrr.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: `₹${metrics.arr.toLocaleString()} ARR`,
      isPositive: true,
    },
    {
      label: 'Total Revenue',
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      icon: Banknote,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: 'Lifetime earnings',
      isPositive: true,
    },
    {
      label: 'Avg Revenue / User',
      value: `₹${metrics.arpu}`,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: 'ARPU',
      isPositive: true,
    },
    {
      label: 'Conversion Rate',
      value: `${metrics.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      trend: 'Free to Paid',
      isPositive: true,
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
            Revenue Analytics
          </h1>
          <p className="text-muted-foreground font-sans">
            Track business growth, subscription health, and financial
            performance.
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

      <div className="grid gap-6 md:grid-cols-12">
        {/* Revenue Trend */}
        <Card className="md:col-span-8 rounded-2xl border-border shadow-sm overflow-hidden bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue performance (Last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] w-full px-4 pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Breakdown */}
        <Card className="md:col-span-4 rounded-2xl border-border shadow-sm overflow-hidden bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Revenue by Plan</CardTitle>
            <CardDescription>
              Financial distribution across plans
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.revenueByPlan}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="_id"
                  >
                    {charts.revenueByPlan.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={REVENUE_COLORS[index % REVENUE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {charts.revenueByPlan.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          REVENUE_COLORS[i % REVENUE_COLORS.length],
                      }}
                    />
                    <span className="text-sm font-medium">{item._id}</span>
                  </div>
                  <span className="text-sm font-bold">
                    ₹{item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Metrics */}
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Subscription Insights
          </CardTitle>
          <CardDescription>
            Detailed look at active subscriptions and conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Active Paid Subscriptions
              </p>
              <p className="text-2xl font-black">
                {metrics.activeSubscriptions}
              </p>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4fb8b2]"
                  style={{ width: `${metrics.conversionRate}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Estimated MRR
              </p>
              <p className="text-2xl font-black">
                ₹{metrics.mrr.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                Growing monthly
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Customer Lifetime Value (Est)
              </p>
              <p className="text-2xl font-black">
                ₹{(metrics.arpu * 12).toFixed(2)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Based on current ARPU
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
