import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useState, useEffect } from 'react'
import { adminApi } from '@/api/admin.api'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreVertical,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'
import { useDebounce } from '@/hooks/use-debounce'

export const Route = createFileRoute('/_app/admin/users/')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user?.userType !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const { token } = useAuthStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('all')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'admin',
      'users',
      page,
      debouncedSearch,
      plan,
      status,
      sortBy,
      order,
    ],
    queryFn: () =>
      adminApi.listUsers(token!, {
        page,
        limit: 10,
        search: debouncedSearch,
        plan: plan === 'all' ? '' : plan,
        status: status === 'all' ? '' : status,
        sortBy,
        order,
      }),
  })

  const users = data?.users || []
  const pagination = data?.pagination || { total: 0, pages: 1 }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setOrder('desc')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            User Management
          </h1>
          <p className="text-muted-foreground font-sans">
            View and manage all registered users.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/50 backdrop-blur-xl border border-border/50 p-4 rounded-xl">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Filter by Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="max">Max</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('subscriptionType')}
                  className="hover:bg-transparent p-0 flex items-center gap-1 font-sans"
                >
                  Plan <ArrowUpDown className="w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('subscriptionStatus')}
                  className="hover:bg-transparent p-0 flex items-center gap-1 font-sans"
                >
                  Status <ArrowUpDown className="w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('createdAt')}
                  className="hover:bg-transparent p-0 flex items-center gap-1 font-sans"
                >
                  Joined <ArrowUpDown className="w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('lastActive')}
                  className="hover:bg-transparent p-0 flex items-center gap-1 font-sans"
                >
                  Last Active <ArrowUpDown className="w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-10 w-40 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-16 ml-auto bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground font-sans"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow
                  key={user._id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-foreground font-sans truncate max-w-[150px]">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.subscriptionType === 'max'
                          ? 'default'
                          : user.subscriptionType === 'pro'
                            ? 'default'
                            : 'secondary'
                      }
                      className={`capitalize font-sans ${
                        user.subscriptionType === 'max'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : ''
                      }`}
                    >
                      {user.subscriptionType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.subscriptionStatus === 'active'
                          ? 'outline'
                          : 'destructive'
                      }
                      className="capitalize font-sans"
                    >
                      {user.subscriptionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-sans">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-sans">
                    {format(new Date(user.lastActive), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/admin/users/$userId"
                      params={{ userId: user._id }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-sans group-hover:border-primary group-hover:text-primary transition-colors"
                      >
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center bg-card/30 backdrop-blur-xl border border-border/50 p-4 rounded-xl">
        <p className="text-sm text-muted-foreground font-sans">
          Showing{' '}
          <span className="font-medium text-foreground">{users.length}</span> of{' '}
          <span className="font-medium text-foreground">
            {pagination.total}
          </span>{' '}
          users
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="font-sans"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }).map(
              (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              },
            )}
            {pagination.pages > 5 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="font-sans"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
