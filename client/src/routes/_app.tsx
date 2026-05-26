import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import {
  LayoutDashboard,
  ScanLine,
  Contact,
  FileText,
  Mail,
  Settings,
  Sparkles,
  ChevronRight,
  Search,
  User,
  LogOut,
  Bell,
  PanelLeft,
  Shield,
  UsersRound,
  CreditCard,
  BarChart,
} from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

const navItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    url: '/dashboard',
  },
  {
    title: 'Scan Card',
    icon: ScanLine,
    url: '/scan',
  },
  {
    title: 'Contacts',
    icon: Contact,
    url: '/contacts',
  },
  {
    title: 'Templates',
    icon: FileText,
    items: [
      { title: 'Create Template', url: '/templates/create' },
      { title: 'Existing Templates', url: '/templates' },
    ],
  },
  {
    title: 'Email Campaign',
    icon: Mail,
    url: '/campaigns',
  },
]

const adminNavItems = [
  {
    title: 'Admin Dashboard',
    icon: Shield,
    url: '/admin/dashboard',
  },
  {
    title: 'Users Table',
    icon: UsersRound,
    url: '/admin/users',
  },
  {
    title: 'Plans',
    icon: CreditCard,
    url: '/admin/plans',
  },
  {
    title: 'Analytics',
    icon: BarChart,
    items: [
      { title: 'User Analytics', url: '/admin/analytics/users' },
      { title: 'Revenue Analytics', url: '/admin/analytics/revenue' },
    ],
  },
]

const footerItems = [
  {
    title: 'Settings',
    icon: Settings,
    url: '/settings',
    highlight: false,
  },
  {
    title: 'Upgrade Plan',
    icon: Sparkles,
    url: '/plan',
    highlight: true,
  },
]

const adminFooterItems = [
  {
    title: 'Settings',
    icon: Settings,
    url: '/settings',
    highlight: false,
  },
]

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore()

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      navigate({ to: '/auth/login' })
    }
  }, [_hasHydrated, isAuthenticated, navigate])

  if (!_hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4fb8b2] border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading LYICard...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth/login' })
  }

  const currentNavItems = user?.userType === 'admin' ? adminNavItems : navItems
  const currentFooterItems =
    user?.userType === 'admin' ? adminFooterItems : footerItems

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4fb8b2] shadow-lg shadow-[#4fb8b2]/20 group-hover:scale-105 transition-transform">
                <ScanLine className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground font-sans">
                LYICard
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {user?.userType === 'admin' ? 'Admin Menu' : 'Main Menu'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {currentNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.items ? (
                        <Collapsible
                          defaultOpen={item.items.some(
                            (sub) => location.pathname === sub.url,
                          )}
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="hover:bg-accent transition-colors w-full group">
                              <item.icon className="h-4 w-4 text-foreground/70 group-hover:text-foreground" />
                              <span className="font-sans font-medium text-foreground">
                                {item.title}
                              </span>
                              <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub className="border-l border-border ml-4 pl-2 mt-1 space-y-1">
                              {item.items.map((sub) => (
                                <SidebarMenuSubItem key={sub.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={location.pathname === sub.url}
                                  >
                                    <Link
                                      to={sub.url}
                                      className={`font-sans text-sm transition-colors ${
                                        location.pathname === sub.url
                                          ? 'text-[#4fb8b2] font-semibold'
                                          : 'text-muted-foreground hover:text-[#4fb8b2]'
                                      }`}
                                    >
                                      {sub.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                          className="hover:bg-accent transition-colors group"
                        >
                          <Link
                            to={item.url}
                            className="flex items-center gap-3"
                          >
                            <item.icon
                              className={`h-4 w-4 ${location.pathname === item.url ? 'text-[#4fb8b2]' : 'text-foreground/70 group-hover:text-foreground'}`}
                            />
                            <span
                              className={`font-sans font-medium ${location.pathname === item.url ? 'text-[#4fb8b2] font-bold' : 'text-foreground'}`}
                            >
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border space-y-2">
            {currentFooterItems.map((item) => (
              <SidebarMenuButton
                key={item.title}
                asChild
                isActive={location.pathname === item.url}
                className={`transition-colors ${item.highlight ? 'bg-[#4fb8b2]/10 text-[#4fb8b2] hover:bg-[#4fb8b2]/20' : 'hover:bg-accent'}`}
              >
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span
                    className={`font-sans font-medium ${item.highlight ? 'font-bold' : ''}`}
                  >
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors mt-4 text-left group">
                  <Avatar className="h-8 w-8 border-2 border-[#4fb8b2]/20">
                    <AvatarImage
                      src={user?.avatar || 'https://github.com/shadcn.png'}
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-foreground truncate font-sans">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-sans">
                      {user?.email || 'email@example.com'}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="gap-2 cursor-pointer text-red-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden">
                <PanelLeft className="h-5 w-5 text-foreground" />
              </SidebarTrigger>
              <div className="relative hidden md:flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10 h-9 w-[300px] bg-accent/50 border-none focus-visible:ring-[#4fb8b2] transition-all font-sans"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="relative text-foreground hover:bg-accent transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 lg:p-10 relative bg-background/50">
            <div className="max-w-7xl mx-auto h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
