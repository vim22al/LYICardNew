import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Input } from '#/components/ui/input'
import {
  Scan,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Building,
  Database,
} from 'lucide-react'

export const ScannerDemo = () => {
  const [step, setStep] = useState(0)

  // Auto animation sequence for demo
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 3 ? 0 : prev + 1))
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-lagoon/20 blur-[60px] rounded-full point-events-none -z-10"></div>

      <Card className="border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl p-4 overflow-hidden relative min-h-[400px]">
        {/* Step 0: Initial card */}
        <AnimatePresence mode="popLayout">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
              className="flex flex-col items-center justify-center h-[350px] space-y-6"
            >
              <div className="w-64 h-36 bg-gradient-to-br from-lagoon-deep to-sea-ink rounded-lg shadow-lg relative p-4 transform -rotate-3 overflow-hidden border border-white/10">
                {/* Dummy business card UI */}
                <div className="absolute top-4 left-4 w-8 h-8 rounded bg-lagoon/80"></div>
                <div className="absolute top-16 left-4 h-3 w-32 bg-white/20 rounded"></div>
                <div className="absolute top-22 left-4 h-2 w-20 bg-white/20 rounded"></div>
                <div className="absolute bottom-4 right-4 h-2 w-24 bg-white/20 rounded"></div>
                <div className="absolute top-4 right-4 h-4 w-4 rounded-full bg-lagoon/80"></div>
              </div>
              <div className="flex items-center gap-2 text-foreground/80 animate-pulse">
                <Scan className="size-5 text-primary" />
                <span className="font-medium">Ready to scan</span>
              </div>
            </motion.div>
          )}

          {/* Step 1: Scanning animation */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(5px)' }}
              className="flex flex-col items-center justify-center h-[350px] relative"
            >
              <div className="w-64 h-36 bg-gradient-to-br from-lagoon-deep to-sea-ink rounded-lg shadow-lg relative p-4 overflow-hidden border border-white/10">
                {/* The "scanner" laser line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-lagoon shadow-[0_0_8px_2px_rgba(79,184,178,0.8)] z-10"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{
                    duration: 1.5,
                    ease: 'linear',
                    repeat: Infinity,
                  }}
                />
                <div className="absolute top-4 left-4 w-8 h-8 rounded bg-lagoon/80"></div>
                <div className="absolute top-16 left-4 h-3 w-32 bg-white/20 rounded"></div>
                <div className="absolute top-22 left-4 h-2 w-20 bg-white/20 rounded"></div>
                <div className="absolute bottom-4 right-4 h-2 w-24 bg-white/20 rounded"></div>
              </div>
              <Badge className="absolute bottom-10 bg-primary text-primary-foreground border-0 py-1 px-3">
                <Scan className="size-3 mr-2 animate-spin-slow" />
                Extracting AI Data...
              </Badge>
            </motion.div>
          )}

          {/* Step 2 & 3: Extracted Form Data */}
          {step >= 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-2 mb-4 text-emerald-500 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">
                <CheckCircle2 className="size-5" />
                <span className="font-medium text-sm">
                  Successfully extracted!
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1">
                    <User className="size-3" /> Full Name
                  </label>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.1 }}
                  >
                    <Input
                      value="Alexandra Smith"
                      readOnly
                      className="bg-background/50 border-border/50"
                    />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1">
                    <Building className="size-3" /> Company
                  </label>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.3 }}
                  >
                    <Input
                      value="Acme Innovations Ltd."
                      readOnly
                      className="bg-background/50 border-border/50"
                    />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1">
                    <Mail className="size-3" /> Email
                  </label>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5 }}
                  >
                    <Input
                      value="alexandra@acme.ai"
                      readOnly
                      className="bg-background/50 border-border/50"
                    />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-1">
                    <Phone className="size-3" /> Phone
                  </label>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.7 }}
                  >
                    <Input
                      value="+1 (555) 123-4567"
                      readOnly
                      className="bg-background/50 border-border/50"
                    />
                  </motion.div>
                </div>
              </div>

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="bg-primary text-primary-foreground p-3 rounded-md text-center text-sm font-medium flex items-center justify-center gap-2 shadow-md">
                    <CheckCircle2 className="size-4 text-primary-foreground" />
                    Saved to Database
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Decorative floating badges */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-8 top-12 z-20"
      >
        <Badge className="bg-card text-foreground border border-border shadow-sm py-1.5 px-3 backdrop-blur-sm">
          <Scan className="size-3 mr-1.5 text-primary" /> 99.8% Accuracy
        </Badge>
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -left-8 bottom-24 z-20"
      >
        <Badge className="bg-card text-foreground border border-border shadow-sm py-1.5 px-3 backdrop-blur-sm">
          <Database className="size-3 mr-1.5 text-primary" /> Auto-sync
        </Badge>
      </motion.div>
    </div>
  )
}
