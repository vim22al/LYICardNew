import React from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Button } from '#/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export const CtaSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-muted/50 border-t border-border">
      {/* Animated decorative glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="size-4 text-primary" />
            <span>START SCANNING TODAY</span>
          </div>

          <h2 className="text-4xl md:text-7xl font-black text-foreground tracking-tight leading-[1.1]">
            Ready to turn business cards into <br className="hidden md:block" />
            <span>valuable contacts?</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Scan business cards instantly, organize contacts automatically, and
            grow your network without manual data entry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Button
              size="lg"
              className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto text-lg font-black shadow-lg transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link to="/auth/signup">
                Start Scanning for Free
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 border-border text-foreground hover:bg-accent w-full sm:w-auto text-lg font-bold transition-all duration-300"
              asChild
            >
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-10 border-t border-border">
            {[
              'No credit card required',
              '10 card scans per month',
              'Free trial',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-foreground text-sm font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
