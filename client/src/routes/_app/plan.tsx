import { createFileRoute } from '@tanstack/react-router'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_app/plan')({
  component: PlanPage,
})

function PlanPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-sans">
          Upgrade Your Presence
        </h1>
        <p className="text-lg text-muted-foreground font-sans">
          Choose the plan that's right for your business growth.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {[
          {
            name: 'Free',
            price: '0',
            features: ['10 Scans / month', 'Basic CRM', 'Email Support'],
            current: true,
          },
          {
            name: 'Pro',
            price: '29',
            features: [
              'Unlimited Scans',
              'WhatsApp Integration',
              'Bulk Campaigns',
              'AI Enrichment',
            ],
            popular: true,
          },
          {
            name: 'Enterprise',
            price: '99',
            features: [
              'Custom Branding',
              'API Access',
              'Dedicated Manager',
              'Team Workspaces',
            ],
          },
        ].map((plan, i) => (
          <div
            key={plan.name}
            className={`relative p-8 rounded-3xl bg-card border ${
              plan.popular
                ? 'border-[#4fb8b2] ring-4 ring-[#4fb8b2]/5'
                : 'border-border'
            } shadow-sm flex flex-col transition-all`}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4fb8b2] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-foreground font-sans">
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground font-sans">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground font-sans">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-muted-foreground font-sans text-sm"
                >
                  <div className="h-5 w-5 rounded-full bg-[#4fb8b2]/10 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-[#4fb8b2]" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className={`w-full h-11 rounded-xl font-bold transition-all border-none ${
                plan.current
                  ? 'bg-accent text-muted-foreground cursor-not-allowed'
                  : 'bg-[#4fb8b2] hover:bg-lagoon-deep text-white shadow-lg shadow-[#4fb8b2]/20'
              }`}
            >
              {plan.current ? 'Current Plan' : 'Select Plan'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
