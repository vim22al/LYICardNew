import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useState } from 'react'
import { adminApi } from '@/api/admin.api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CreditCard,
  Package,
  Zap,
  Loader2,
  Info,
} from 'lucide-react'

const planFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  currency: z.string().default('USD'),
  interval: z.enum(['month', 'year']),
  features: z.string().transform((val) =>
    val
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f),
  ),
  limits: z.object({
    maxContacts: z.coerce.number().min(1),
    maxCampaigns: z.coerce.number().min(1),
    maxTemplates: z.coerce.number().min(1),
  }),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
})

type PlanFormValues = z.infer<typeof planFormSchema>

export const Route = createFileRoute('/_app/admin/plans/')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user?.userType !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminPlansPage,
})

function AdminPlansPage() {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminApi.listPlans(token!),
  })

  const form = useForm<any>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: '',
      limits: {
        maxContacts: 100,
        maxCampaigns: 5,
        maxTemplates: 5,
      },
      isActive: true,
      isDefault: false,
    },
  })

  const openCreateSheet = () => {
    setEditingPlan(null)
    form.reset({
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: '',
      limits: {
        maxContacts: 100,
        maxCampaigns: 5,
        maxTemplates: 5,
      },
      isActive: true,
      isDefault: false,
    })
    setIsSheetOpen(true)
  }

  const openEditSheet = (plan: any) => {
    setEditingPlan(plan)
    form.reset({
      ...plan,
      features: plan.features.join(', '),
    })
    setIsSheetOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: (values: PlanFormValues) => adminApi.createPlan(token!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      setIsSheetOpen(false)
      toast.success('Plan created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create plan')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: PlanFormValues) =>
      adminApi.updatePlan(token!, editingPlan._id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      setIsSheetOpen(false)
      toast.success('Plan updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update plan')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (planId: string) => adminApi.deletePlan(token!, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      toast.success('Plan deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete plan')
    },
  })

  const onSubmit = (values: PlanFormValues) => {
    if (editingPlan) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">
            Plan Management
          </h1>
          <p className="text-muted-foreground font-sans">
            Configure subscription tiers and pricing.
          </p>
        </div>
        <Button onClick={openCreateSheet} className="font-sans gap-2">
          <Plus className="w-4 h-4" /> Create Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-card/30 backdrop-blur-xl border-border/50 animate-pulse h-[300px]"
            />
          ))}
        </div>
      ) : plans?.length === 0 ? (
        <div className="text-center py-20 bg-card/10 rounded-2xl border border-dashed border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-foreground">
            No plans found
          </h3>
          <p className="text-muted-foreground">
            Get started by creating your first subscription plan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: any) => (
            <Card
              key={plan._id}
              className="bg-card/30 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all group overflow-hidden flex flex-col"
            >
              <CardHeader className="relative">
                {plan.isDefault && (
                  <Badge className="absolute top-4 right-4 bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                    Default
                  </Badge>
                )}
                <CardTitle className="flex items-center gap-2 font-sans">
                  <CreditCard className="w-5 h-5 text-primary" /> {plan.name}
                </CardTitle>
                <CardDescription className="font-sans min-h-[40px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-sans">
                    ₹{plan.price}
                  </span>
                  <span className="text-muted-foreground font-sans">
                    /{plan.interval}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">
                    Limits
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-background/50 p-2 rounded text-center">
                      <p className="font-bold">{plan.limits.maxContacts}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Contacts
                      </p>
                    </div>
                    <div className="bg-background/50 p-2 rounded text-center">
                      <p className="font-bold">{plan.limits.maxCampaigns}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Campaigns
                      </p>
                    </div>
                    <div className="bg-background/50 p-2 rounded text-center">
                      <p className="font-bold">{plan.limits.maxTemplates}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Templates
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">
                    Features
                  </p>
                  <ul className="space-y-1">
                    {plan.features.map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm flex items-start gap-2 font-sans"
                      >
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t border-border/50 p-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditSheet(plan)}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to delete this plan?',
                      )
                    ) {
                      deleteMutation.mutate(plan._id)
                    }
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 text-left">
            <SheetTitle className="font-sans">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </SheetTitle>
            <SheetDescription className="font-sans">
              Define pricing and limits for your subscription tier.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="e.g. Pro Monthly"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...form.register('description')}
                  placeholder="Short description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" {...form.register('price')} />
                </div>
                <div className="space-y-2">
                  <Label>Interval</Label>
                  <Select
                    onValueChange={(val) => form.setValue('interval', val)}
                    defaultValue={form.watch('interval')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (Comma separated)</Label>
                <Input
                  id="features"
                  {...form.register('features')}
                  placeholder="Unlimited cards, AI Scan, Priority Support"
                />
                <p className="text-[10px] text-muted-foreground">
                  Enter features separated by commas.
                </p>
              </div>

              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Usage Limits
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="maxContacts" className="text-[10px]">
                      Contacts
                    </Label>
                    <Input
                      id="maxContacts"
                      type="number"
                      {...form.register('limits.maxContacts')}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="maxCampaigns" className="text-[10px]">
                      Campaigns
                    </Label>
                    <Input
                      id="maxCampaigns"
                      type="number"
                      {...form.register('limits.maxCampaigns')}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="maxTemplates" className="text-[10px]">
                      Templates
                    </Label>
                    <Input
                      id="maxTemplates"
                      type="number"
                      {...form.register('limits.maxTemplates')}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    {...form.register('isDefault')}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                    Default Plan
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...form.register('isActive')}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isActive" className="text-sm cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
            </div>

            <SheetFooter className="mt-8 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full sm:w-auto gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
