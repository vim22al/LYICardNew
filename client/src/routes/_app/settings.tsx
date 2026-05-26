import { createFileRoute } from '@tanstack/react-router'
import { User, Lock, Globe, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/useAuthStore'
import * as settingsApi from '@/api/settings.api'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  jobTitle: z.string().optional(),
})

const securitySchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const smtpSchema = z.object({
  SMTP_HOST: z.string().min(1, 'Host is required'),
  SMTP_PORT: z.string().min(1, 'Port is required'),
  SMTP_USER: z.string().min(1, 'User is required'),
  SMTP_PASS: z.string().min(1, 'Password is required'),
})

function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-sans">
          Settings
        </h1>
        <p className="text-muted-foreground font-sans text-lg">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row gap-10">
          <aside className="md:w-64 shrink-0">
            <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-2 mt-6">
              <TabsTrigger
                value="profile"
                className="flex items-center justify-start gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all data-[state=active]:bg-[#4fb8b2] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#4fb8b2]/20 text-muted-foreground hover:bg-[#4fb8b2]/10 hover:text-[#4fb8b2] border-none"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>

              {user?.authType === 'email' && (
                <TabsTrigger
                  value="security"
                  className="flex items-center justify-start gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all data-[state=active]:bg-[#4fb8b2] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#4fb8b2]/20 text-muted-foreground hover:bg-[#4fb8b2]/10 hover:text-[#4fb8b2] border-none"
                >
                  <Lock className="h-4 w-4" />
                  Security
                </TabsTrigger>
              )}

              {user?.userType === 'admin' && (
                <TabsTrigger
                  value="integrations"
                  className="flex items-center justify-start gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all data-[state=active]:bg-[#4fb8b2] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#4fb8b2]/20 text-muted-foreground hover:bg-[#4fb8b2]/10 hover:text-[#4fb8b2] border-none"
                >
                  <Globe className="h-4 w-4" />
                  Integrations
                </TabsTrigger>
              )}
            </TabsList>
          </aside>

          <div className="flex-1 bg-card p-8 rounded-2xl border border-border shadow-sm min-h-[500px]">
            <TabsContent
              value="profile"
              className="m-0 border-none p-0 focus-visible:ring-0"
            >
              <ProfileSettings />
            </TabsContent>

            {user?.authType === 'email' && (
              <TabsContent
                value="security"
                className="m-0 border-none p-0 focus-visible:ring-0"
              >
                <SecuritySettings />
              </TabsContent>
            )}

            {user?.userType === 'admin' && (
              <TabsContent
                value="integrations"
                className="m-0 border-none p-0 focus-visible:ring-0"
              >
                <IntegrationsSettings />
              </TabsContent>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

function ProfileSettings() {
  const { user, setAuth } = useAuthStore()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      jobTitle: user?.jobTitle || '',
    },
  })

  const mutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully')
      // Update local store
      if (user) {
        setAuth(
          { ...user, name: data.user.name, jobTitle: data.user.jobTitle },
          localStorage.getItem('token') || '',
        )
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    },
  })

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    mutation.mutate(values)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground font-sans">
          Public Profile
        </h2>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          This information will be visible on your business profile.
        </p>
      </div>
      <Separator className="bg-border" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Full Name
            </label>
            <Input
              {...form.register('name')}
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Email Address
            </label>
            <Input
              value={user?.email}
              disabled
              className="bg-muted border-none opacity-60"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Job Title
            </label>
            <Input
              {...form.register('jobTitle')}
              placeholder="e.g. Marketing Director"
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#4fb8b2] hover:bg-lagoon-deep text-white rounded-xl px-8 transition-colors shadow-lg shadow-[#4fb8b2]/20 border-none"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

function SecuritySettings() {
  const form = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: settingsApi.updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully')
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update password')
    },
  })

  const onSubmit = (values: z.infer<typeof securitySchema>) => {
    mutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground font-sans">
          Security
        </h2>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Update your password to keep your account secure.
        </p>
      </div>
      <Separator className="bg-border" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Current Password
            </label>
            <Input
              type="password"
              {...form.register('currentPassword')}
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              New Password
            </label>
            <Input
              type="password"
              {...form.register('newPassword')}
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Confirm New Password
            </label>
            <Input
              type="password"
              {...form.register('confirmPassword')}
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#4fb8b2] hover:bg-lagoon-deep text-white rounded-xl px-8 transition-colors shadow-lg shadow-[#4fb8b2]/20 border-none"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Update Password
          </Button>
        </div>
      </form>
    </div>
  )
}

function IntegrationsSettings() {
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: settingsApi.getAdminSettings,
  })

  const form = useForm<z.infer<typeof smtpSchema>>({
    resolver: zodResolver(smtpSchema),
    values: currentSettings, // Use values instead of defaultValues for async data
  })

  const mutation = useMutation({
    mutationFn: settingsApi.updateAdminSettings,
    onSuccess: () => {
      toast.success('SMTP Settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || 'Failed to update SMTP settings',
      )
    },
  })

  const onSubmit = (values: z.infer<typeof smtpSchema>) => {
    mutation.mutate(values)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#4fb8b2]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground font-sans">
          SMTP Configuration
        </h2>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Configure your email server settings for campaigns and notifications.
        </p>
      </div>
      <Separator className="bg-border" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              SMTP Host
            </label>
            <Input
              {...form.register('SMTP_HOST')}
              placeholder="smtp.example.com"
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              SMTP Port
            </label>
            <Input
              {...form.register('SMTP_PORT')}
              placeholder="587"
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              SMTP User
            </label>
            <Input
              {...form.register('SMTP_USER')}
              placeholder="user@example.com"
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              SMTP Password
            </label>
            <Input
              type="password"
              {...form.register('SMTP_PASS')}
              placeholder="••••••••"
              className="bg-accent border-none focus-visible:ring-[#4fb8b2]"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#4fb8b2] hover:bg-lagoon-deep text-white rounded-xl px-8 transition-colors shadow-lg shadow-[#4fb8b2]/20 border-none"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}
