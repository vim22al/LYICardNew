import { createFileRoute, Link } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { ScanLine, Mail, ArrowLeft } from 'lucide-react'

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
import { useForgotPasswordMutation } from '@/hooks/useAuthHooks'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordComponent,
})

function ForgotPasswordComponent() {
  const { mutate, isPending, isSuccess } = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    mutate(data.email)
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
            Recover your <span className="text-[#4fb8b2]">Account</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed font-sans">
            Don't worry, it happens to the best of us. Enter your email and
            we'll send you a link to reset your password.
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
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-muted-foreground font-sans">
                Enter your email address and we'll send you a recovery link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-[#4fb8b2]/10 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-[#4fb8b2]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground font-sans">
                      Check your email
                    </h3>
                    <p className="text-muted-foreground text-sm font-sans">
                      We've sent a password recovery link to your email address.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium font-sans"
                    >
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-[#4fb8b2] transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 h-11 bg-background/50 border-border focus-visible:ring-[#4fb8b2] rounded-xl transition-all"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive font-medium font-sans pl-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-11 bg-[#4fb8b2] hover:bg-[#328f97] text-white font-sans font-bold shadow-lg shadow-[#4fb8b2]/20 transition-all rounded-xl mt-2"
                  >
                    {isPending ? 'Sending Link...' : 'Send Reset Email'}
                  </Button>
                </form>
              )}

              <div className="mt-6 flex justify-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
