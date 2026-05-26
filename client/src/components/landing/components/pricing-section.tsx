import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    description: 'Perfect to test the waters',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '10 card scans per month',
      'Basic contact storage',
      'Export to CSV',
      'Email support',
    ],
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const,
  },
  {
    name: 'Pro',
    description: 'For professionals who network often',
    monthlyPrice: 1200,
    yearlyPrice: 1000,
    popular: true,
    features: [
      '500 card scans per month',
      'Full contact management',
      'Smart tags & folders',
      'Email templates',
      'CRM integrations',
      'Priority email support',
    ],
    buttonText: 'Get Started Pro',
    buttonVariant: 'default' as const,
  },
  {
    name: 'Max',
    description: 'For teams and high-volume users',
    monthlyPrice: 2400,
    yearlyPrice: 2000,
    features: [
      'Unlimited card scans',
      'Team access & sharing',
      'Smart tags & folders',
      'WhatsApp & Email templates',
      'CRM integrations',
      'Call support',
    ],
    buttonText: 'Get Started Max',
    buttonVariant: 'outline' as const,
  },
]

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section
      id="pricing"
      className="py-24 bg-background relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full" />

      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Choose the plan that best fits your networking volume.
          </p>

          <div className="flex items-center justify-center gap-4 pt-6">
            <span
              className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-7 w-12 items-center rounded-full bg-accent transition-all duration-300 hover:bg-accent/80"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-primary shadow-sm transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span
              className={`text-sm font-semibold flex items-center gap-2 transition-colors ${isYearly ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Annually{' '}
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0 text-[10px] font-bold uppercase transition-all">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold px-4 py-1 border-none shadow-xl ring-4 ring-background">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card
                className={`h-full flex flex-col transition-all duration-500 ${plan.popular ? 'border-primary shadow-2xl shadow-primary/10 scale-105 relative z-10 bg-card' : 'border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 bg-card/50 backdrop-blur-sm'}`}
              >
                <CardHeader className="text-center pb-4 pt-8">
                  <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground pt-1">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-8">
                  <div className="my-6 text-center">
                    <span className="text-5xl font-black text-foreground tracking-tighter">
                      ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground ml-1 font-medium">
                      /mo
                    </span>
                  </div>

                  <div className="space-y-4 mt-8">
                    {plan.features.map((feature, fidx) => (
                      <div
                        key={fidx}
                        className="flex items-start gap-3 group/item"
                      >
                        <div
                          className={`flex-shrink-0 mt-0.5 p-1 rounded-full transition-colors ${plan.popular ? 'bg-primary/20' : 'bg-accent group-hover/item:bg-primary/10'}`}
                        >
                          <Check
                            className={`size-3.5 transition-colors ${plan.popular ? 'text-primary' : 'text-muted-foreground group-hover/item:text-primary'}`}
                          />
                        </div>
                        <span className="text-foreground/90 text-sm font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pb-8">
                  <Button
                    className={`w-full h-12 text-sm font-bold transition-all duration-300 ${plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20' : 'hover:bg-primary hover:text-primary-foreground hover:border-primary'}`}
                    variant={plan.buttonVariant}
                    size="lg"
                    asChild
                  >
                    <Link to="/auth/signup">{plan.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
