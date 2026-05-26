import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '#/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote:
      'LYICard has completely changed how I handle networking events. I used to come back with a stack of cards and spend hours typing them. Now, it takes me literally seconds.',
    name: 'Sarah Jenkins',
    role: 'Sales Director, TechFlow',
    initials: 'SJ',
    image: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    quote:
      "The direct WhatsApp integration is a game-changer. I scan a card, the data is saved, and I instantly shoot them a 'great meeting you' text. My response rate has doubled.",
    name: 'Michael Chen',
    role: 'Freelance Consultant',
    initials: 'MC',
    image: 'https://i.pravatar.cc/150?u=michael',
  },
  {
    quote:
      'As an agency, we collect hundreds of contacts. Managing them in one place with smart tagging lets our sales team easily filter and send targeted email campaigns.',
    name: 'Elena Rodriguez',
    role: 'VP Marketing, GrowthSphere',
    initials: 'ER',
    image: 'https://i.pravatar.cc/150?u=elena',
  },
]

export const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by networking pros
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. Here's what our users have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="h-full border-border/50 shadow-sm bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-2xl group">
                <CardContent className="p-8 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex gap-1 mb-6 text-primary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="size-4 fill-current group-hover:scale-110 transition-transform"
                        />
                      ))}
                    </div>
                    <p className="text-lg text-foreground/80 italic mb-8">
                      "{test.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={test.image} alt={test.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {test.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {test.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {test.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
