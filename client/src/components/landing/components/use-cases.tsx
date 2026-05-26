import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Briefcase, Building2, Ticket, Users } from 'lucide-react'

const useCases = [
  {
    icon: <Briefcase className="size-6" />,
    persona: 'Sales Professionals',
    description:
      'Scan business cards immediately after meetings. Auto-enrich data and trigger follow-up sequences in your CRM without typing a single word.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: <Users className="size-6" />,
    persona: 'Freelancers & Consultants',
    description:
      "Stop losing potential client contacts in your pocket. Keep a meticulously organized digital rolodex that's easy to search and export when you need it.",
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: <Building2 className="size-6" />,
    persona: 'Agencies & Recruiters',
    description:
      'Centralize networking data across your entire team. Collect contacts collaboratively and run targeted cadences via email and WhatsApp.',
    color: 'bg-lagoon/20 text-lagoon-deep',
  },
  {
    icon: <Ticket className="size-6" />,
    persona: 'Event Attendees',
    description:
      'Max out your conference ROI. Batch scan dozens of cards at the end of the day and send personalized connection requests in bulk.',
    color: 'bg-orange-100 text-orange-700',
  },
]

export const UseCases = () => {
  return (
    <section id="use-cases" className="py-24 bg-muted/20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0">
              Who's it for?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for people who connect
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you're closing deals or building your freelance network,
              LYICard adapts to your workflow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Briefcase className="size-6" />,
              persona: 'Sales Professionals',
              description:
                'Scan business cards immediately after meetings. Auto-enrich data and trigger follow-up sequences in your CRM without typing a single word.',
              color: 'bg-primary/10 text-primary',
            },
            {
              icon: <Users className="size-6" />,
              persona: 'Freelancers',
              description:
                "Stop losing potential client contacts in your pocket. Keep a meticulously organized digital rolodex that's easy to search and export when you need it.",
              color: 'bg-lagoon/20 text-lagoon-deep',
            },
            {
              icon: <Building2 className="size-6" />,
              persona: 'Agencies & Recruiters',
              description:
                'Centralize networking data across your entire team. Collect contacts collaboratively and run targeted cadences via email and WhatsApp.',
              color: 'bg-palm/20 text-palm',
            },
            {
              icon: <Ticket className="size-6" />,
              persona: 'Event Attendees',
              description:
                'Max out your conference ROI. Batch scan dozens of cards at the end of the day and send personalized connection requests in bulk.',
              color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
            },
          ].map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 bg-card overflow-hidden group rounded-2xl">
                <CardContent className="p-6">
                  <div
                    className={`p-3 rounded-xl inline-flex mb-6 ${useCase.color} group-hover:scale-110 transition-transform`}
                  >
                    {useCase.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {useCase.persona}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {useCase.description}
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
