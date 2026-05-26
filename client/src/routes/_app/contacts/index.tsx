import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  useContactsQuery,
  useDeleteContactMutation,
} from '@/hooks/useContactHooks'
import {
  Loader2,
  Mail,
  Phone,
  Building2,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  User,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Eye,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/_app/contacts/')({
  component: ContactsPage,
})

function ContactsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    order: 'desc',
  })

  const deleteMutation = useDeleteContactMutation()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: contacts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useContactsQuery(
    {
      search: debouncedSearch,
      status: statusFilter,
      sortBy: sortConfig.field,
      order: sortConfig.order,
    },
    {
      refetchInterval: 5000,
    },
  )

  const toggleSort = (field: string) => {
    setSortConfig((current) => ({
      field,
      order:
        current.field === field && current.order === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    name: string,
  ) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (err) {}
    }
  }

  const handleRowClick = (contactId: string) => {
    navigate({ to: '/contacts/$contactId', params: { contactId } })
  }

  const handleExportCSV = () => {
    if (!contacts.length) return

    const headers = [
      'Name',
      'Title',
      'Company',
      'Email',
      'Phone',
      'Status',
      'Created At',
    ]
    const csvContent = contacts.map((contact: any) => {
      return [
        contact.name || '',
        contact.title || '',
        contact.company || '',
        contact.email || '',
        contact.phone || '',
        contact.status || '',
        contact.createdAt ? new Date(contact.createdAt).toISOString() : '',
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',')
    })

    csvContent.unshift(headers.join(','))
    const csvString = csvContent.join('\n')

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `contacts_export_${new Date().toISOString().split('T')[0]}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isError) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold font-sans">Failed to load contacts</h2>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground font-sans uppercase">
            Contacts
          </h1>
          <p className="text-muted-foreground font-sans text-sm">
            Manage and organize your network with powerful search and filters.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="font-bold rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link to="/scan">
            <Button className="bg-[#4fb8b2] hover:bg-lagoon-deep text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
              + New Contact
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-3xl border border-border backdrop-blur-xl">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#4fb8b2] transition-colors" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-background/50 border-border focus:ring-[#4fb8b2] rounded-xl transition-all font-sans"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-border gap-2 font-bold px-5"
            >
              <Filter className="h-4 w-4" />
              {statusFilter === 'all'
                ? 'All Status'
                : statusFilter.charAt(0)?.toUpperCase() + statusFilter.slice(1)}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-border p-2"
          >
            <DropdownMenuLabel className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
              Filter by Status
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilter === 'all'}
              onCheckedChange={() => setStatusFilter('all')}
            >
              All Contacts
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === 'completed'}
              onCheckedChange={() => setStatusFilter('completed')}
            >
              Completed
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === 'processing'}
              onCheckedChange={() => setStatusFilter('processing')}
            >
              Processing
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-3xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-accent/30">
            <TableRow className="hover:bg-transparent border-border border-b-2">
              <TableHead
                className="w-[280px] font-black uppercase text-[10px] tracking-widest text-muted-foreground cursor-pointer group"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2 py-2">
                  Contact{' '}
                  <ArrowUpDown
                    className={`h-3 w-3 ${sortConfig.field === 'name' ? 'text-[#4fb8b2]' : 'opacity-30'}`}
                  />
                </div>
              </TableHead>
              <TableHead
                className="w-[200px] font-black uppercase text-[10px] tracking-widest text-muted-foreground cursor-pointer group"
                onClick={() => toggleSort('company')}
              >
                <div className="flex items-center gap-2 py-2">
                  Company{' '}
                  <ArrowUpDown
                    className={`h-3 w-3 ${sortConfig.field === 'company' ? 'text-[#4fb8b2]' : 'opacity-30'}`}
                  />
                </div>
              </TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                Details
              </TableHead>
              <TableHead className="w-[120px] font-black uppercase text-[10px] tracking-widest text-muted-foreground text-center">
                Status
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-border">
                    <TableCell>
                      <div className="h-4 w-32 bg-accent rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-accent rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-40 bg-accent rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 bg-accent mx-auto rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-8 bg-accent ml-auto rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              : contacts.map((contact: any) => (
                  <TableRow
                    key={contact._id}
                    className="group hover:bg-accent/20 border-border transition-colors cursor-pointer"
                    onClick={() => handleRowClick(contact._id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#4fb8b2]/10 flex items-center justify-center text-[#4fb8b2] font-bold shadow-sm">
                          {contact.name?.charAt(0) || (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground font-sans line-clamp-1">
                            {contact.name}
                          </span>
                          <span className="text-xs text-[#4fb8b2] font-semibold font-sans">
                            {contact.title || 'Professional'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground font-medium font-sans">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">
                          {contact.company || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="font-sans">
                            {contact.email || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span className="font-sans">
                            {contact.phone || '—'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`rounded-full px-3 py-0.5 border-none font-bold text-[10px] uppercase shadow-sm ${contact.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'}`}
                      >
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl w-40"
                        >
                          <DropdownMenuItem
                            onClick={() => handleRowClick(contact._id)}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          <Link
                            to="/extracted/$contactId"
                            params={{ contactId: contact._id }}
                          >
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" /> Edit
                              Info
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={(e) =>
                              handleDelete(e, contact._id, contact.name)
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
