import React from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Button } from '#/components/ui/button'
import { ScannerDemo } from './scanner-demo'
import { ArrowRight, PlayCircle } from 'lucide-react'

export const HeroSection = () => {
  return (
    <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      <div className="absolute justify-center flex -top-24 left-1/2 -translate-x-1/2 -z-10 w-full max-w-[1000px]">
        <div className="w-full h-[500px] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-2">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              LYICard v2.0 is now live
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1]">
              Never type a <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 pb-2">
                business card
              </span>{' '}
              again.
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Instantly scan cards using AI, organize your contacts in seconds,
              and trigger automated WhatsApp and email follow-ups to close deals
              faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button
                size="lg"
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto text-[17px] font-bold shadow-lg hover:shadow-primary/20 transition-all duration-300"
                asChild
              >
                <Link to="/auth/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 border-border text-foreground hover:bg-muted w-full sm:w-auto text-[17px] backdrop-blur-sm"
              >
                <PlayCircle className="mr-2 size-5 text-muted-foreground" />
                See How It Works
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-6 opacity-70">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background"
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="User"
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-muted-foreground text-left">
                <span className="text-foreground font-bold">10,000+</span> cards
                scanned <br />
                this month alone.
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:pl-12 mt-12 lg:mt-0"
          >
            <ScannerDemo />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
