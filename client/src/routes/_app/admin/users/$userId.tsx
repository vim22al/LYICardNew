import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useState, useEffect } from 'react'
import { adminApi } from '@/api/admin.api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Save,
  User as UserIcon,
  Mail,
  Shield,
  CreditCard,
  Calendar,
} from 'lucide-react'
import { format } from 'date-fns'

const userFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subscriptionStatus: z.enum(['active', 'inactive']),
  subscriptionType: z.enum(['free', 'pro', 'max']),
  userType: z.enum(['admin', 'user']),
  plan: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export const Route = createFileRoute('/_app/admin/users/$userId')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user?.userType !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminUserDetailPage,
})

function AdminUserDetailPage() {
  const { userId } = Route.useParams()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminApi.getUser(token!, userId),
  })

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subscriptionStatus: 'inactive',
      subscriptionType: 'free',
      userType: 'user',
      plan: '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        subscriptionType: user.subscriptionType || 'free',
        userType: user.userType || 'user',
        plan: user.plan || '',
      })
    }
  }, [user, form])

  const mutation = useMutation({
    mutationFn: (values: UserFormValues) =>
      adminApi.updateUser(token!, userId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
      toast.success('User updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user')
    },
  })

  const onSubmit = (values: UserFormValues) => {
    mutation.mutate(values)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/admin/users' })}
          className="rounded-full hover:bg-background/80"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            Edit User
          </h1>
          <p className="text-muted-foreground font-sans">
            Modify user profile and subscription settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-1 bg-card/30 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto border-4 border-background shadow-xl">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-2xl">
                {user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4 font-sans">{user?.name}</CardTitle>
            <CardDescription className="font-mono text-xs">
              {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-sans flex items-center gap-2">
                <Shield className="w-4 h-4" /> Role
              </span>
              <span className="font-medium capitalize">{user?.userType}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-sans flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Plan
              </span>
              <span className="font-medium capitalize">
                {user?.subscriptionType}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-sans flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Joined
              </span>
              <span className="font-medium">
                {user?.createdAt
                  ? format(new Date(user.createdAt), 'PP')
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-sans flex items-center gap-2">
                <Loader2 className="w-4 h-4" /> Last Active
              </span>
              <span className="font-medium">
                {user?.lastActive
                  ? format(new Date(user.lastActive), 'PPp')
                  : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2 bg-card/30 backdrop-blur-xl border-border/50">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-sans">User Details</CardTitle>
              <CardDescription>
                Update basic information and account permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" /> Name
                  </Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    className="bg-background/50 border-border/50"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> Email
                  </Label>
                  <Input
                    id="email"
                    {...form.register('email')}
                    className="bg-background/50 border-border/50"
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> User Role
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      form.setValue('userType', val as 'admin' | 'user')
                    }
                    value={form.watch('userType')}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Subscription
                    Type
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      form.setValue('subscriptionType', val as 'free' | 'pro' | 'max')
                    }
                    value={form.watch('subscriptionType')}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free Plan</SelectItem>
                      <SelectItem value="pro">Pro Plan</SelectItem>
                      <SelectItem value="max">Max Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary" /> Subscription
                    Status
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      form.setValue(
                        'subscriptionStatus',
                        val as 'active' | 'inactive',
                      )
                    }
                    value={form.watch('subscriptionStatus')}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Current Plan
                    Name
                  </Label>
                  <Input
                    id="plan"
                    {...form.register('plan')}
                    placeholder="e.g. Early Bird Pro"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t border-border/50 p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/admin/users' })}
                disabled={mutation.isPending}
                className="font-sans"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="font-sans gap-2"
              >
                {mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
