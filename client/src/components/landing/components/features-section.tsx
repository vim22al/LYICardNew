import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '#/components/ui/card'
import {
  ScanText,
  Database,
  MessagesSquare,
  Tags,
  Download,
  ShieldCheck,
} from 'lucide-react'

const features = [
  {
    icon: <ScanText className="size-8 text-primary" />,
    title: 'AI-Powered OCR',
    description:
      'Scan cards with over 98% accuracy. Our AI instantly recognizes and structures names, titles, emails, phones, and company names from any layout.',
  },
  {
    icon: <Database className="size-8 text-primary" />,
    title: 'Smart Contact Database',
    description:
      'Never lose a contact again. Search, filter, and organize your connections in a beautiful, lightning-fast dashboard accessible from anywhere.',
  },
  {
    icon: <MessagesSquare className="size-8 text-primary" />,
    title: 'Bulk Outreach',
    description:
      'Send personalized follow-up emails and WhatsApp messages to selected contacts directly from the platform. Stop exporting to other tools.',
  },
  {
    icon: <Tags className="size-8 text-primary" />,
    title: 'Advanced Segmentation',
    description:
      "Apply custom tags (e.g., 'SaaS Conf 2024', 'Hot Lead') to organize contacts into actionable lists for targeted campaign cadences.",
  },
  {
    icon: <Download className="size-8 text-primary" />,
    title: 'Seamless Exporting',
    description:
      'Export your clean, structured data as CSV or push it directly into HubSpot, Salesforce, or your preferred CRM via our native integrations.',
  },
  {
    icon: <ShieldCheck className="size-8 text-primary" />,
    title: 'Bank-Grade Security',
    description:
      'Your network is your net worth. We protect your contact data with end-to-end encryption and strict data privacy compliance.',
  },
]

export const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 blur-[100px] -z-10 rounded-full" />

      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Everything you need to turn <br className="hidden md:block" /> cards
            into <span className="text-primary">contacts</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A complete toolkit for professionals who want to automate their
            networking follow-ups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 bg-card/50 backdrop-blur-sm group overflow-hidden relative">
                {/* Decorative hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="p-8 relative z-10">
                  <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-2xl bg-accent group-hover:bg-primary/10 transition-colors duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
