import * as React from 'react'
import {
  Scripts,
  createRootRoute,
  ErrorComponent,
  Link,
} from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { useAuthStore } from '@/stores/useAuthStore'

import '@/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
})

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'LYICard' },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: (props) => (
    <RootDocument>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-4xl font-black mb-2 font-sans uppercase tracking-tighter">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          An unexpected error occurred. Our engineers have been notified
          (figuratively).
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => window.location.reload()}
            size="lg"
            className="font-bold"
          >
            Reload Page
          </Button>
          <Button variant="outline" size="lg" className="font-bold" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
        <div className="mt-12 text-left w-full max-w-2xl bg-muted/50 p-6 rounded-2xl border border-border">
          <p className="text-xs font-mono text-muted-foreground uppercase mb-4">
            Error Details
          </p>
          <ErrorComponent {...props} />
        </div>
      </div>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-9xl font-black text-muted/20 absolute select-none">
          404
        </h1>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 font-sans uppercase tracking-tighter">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button size="lg" className="font-bold" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </RootDocument>
  ),
})

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s: { fetchUser: any }) => s.fetchUser)
  const isLoading = useAuthStore((s: { isLoading: any }) => s.isLoading)
  const hasBooted = React.useRef(false)

  React.useEffect(() => {
    if (!hasBooted.current) {
      hasBooted.current = true
      fetchUser()
    }
  }, [fetchUser])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    )
  }

  return <>{children}</>
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground transition-colors duration-300"
      >
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="light" storageKey="cardlyi-ui-theme">
              <TooltipProvider>
                <AuthBootstrap>{children}</AuthBootstrap>
                <Toaster richColors position="bottom-right" />
              </TooltipProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </GoogleOAuthProvider>

        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
