import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '#/components/ui/card'
import { ScanLine, Cpu, Database, Send } from 'lucide-react'

const steps = [
  {
    icon: <ScanLine className="size-8" />,
    title: '1. Snap a Photo',
    description:
      'Take a picture of the business card or upload an image directly to the platform.',
  },
  {
    icon: <Cpu className="size-8" />,
    title: '2. AI Extraction',
    description:
      "Our vision AI instantly reads and structures the contact's name, email, phone, and company.",
  },
  {
    icon: <Database className="size-8" />,
    title: '3. Save & Organize',
    description:
      'Contacts are safely stored in your searchable database. Add custom tags and notes.',
  },
  {
    icon: <Send className="size-8" />,
    title: '4. Follow Up',
    description:
      'Select contacts and instantly send personalized email or WhatsApp templates in bulk.',
  },
]

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            From paper to pipeline in seconds
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop typing. Start connecting. Here is how your new networking
            workflow looks like.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-24 h-24 rounded-full bg-card border-4 border-background shadow-sm flex items-center justify-center text-primary mb-6 relative z-10 hover:scale-105 transition-transform">
                  {step.icon}
                  {/* Step number badge */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
