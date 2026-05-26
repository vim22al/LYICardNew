import { createFileRoute, useSearch } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { ScanLine, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useResetPasswordMutation } from '@/hooks/useAuthHooks'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

type ResetPasswordSearch = {
  token: string
}

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordComponent,
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
    return {
      token: (search.token as string) || '',
    }
  },
})

function ResetPasswordComponent() {
  const { token } = useSearch({ from: '/auth/reset-password' })
  const { mutate, isPending } = useResetPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    mutate({
      token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-lagoon-deep p-12 flex-col justify-between text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#4fb8b2] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#2f6a4a] blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4fb8b2] shadow-lg shadow-[#4fb8b2]/20">
            <ScanLine className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-sans">
            LYICard
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 max-w-md"
        >
          <h1 className="text-5xl font-bold font-sans leading-tight mb-6">
            Secure your <span className="text-[#4fb8b2]">Account</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed font-sans">
            Choose a strong password to ensure your contact data stays safe and
            private.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative z-10 text-sm text-white/60 font-sans"
        >
          © 2024 LYICard. All rights reserved.
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 relative bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-border shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex lg:hidden items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4fb8b2]">
                  <ScanLine className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground font-sans">
                  LYICard
                </span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground font-sans">
                Reset Password
              </CardTitle>
              <CardDescription className="text-muted-foreground font-sans">
                Please enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium font-sans"
                  >
                    New Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-[#4fb8b2] transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10 h-11 bg-background/50 border-border focus-visible:ring-[#4fb8b2] rounded-xl transition-all"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive font-medium font-sans pl-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium font-sans"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-[#4fb8b2] transition-colors" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="pl-10 h-11 bg-background/50 border-border focus-visible:ring-[#4fb8b2] rounded-xl transition-all"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive font-medium font-sans pl-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-[#4fb8b2] hover:bg-[#328f97] text-white font-sans font-bold shadow-lg shadow-[#4fb8b2]/20 transition-all rounded-xl mt-2"
                >
                  {isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
