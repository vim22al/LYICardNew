import React from 'react'
import { motion } from 'motion/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'

const faqs = [
  {
    question: 'How accurate is the AI data extraction?',
    answer:
      'Our AI model uses highly advanced OCR and NLP to achieve over 98% accuracy on standard business cards, supporting multiple languages and complex layouts. You always have the chance to review and edit before saving.',
  },
  {
    question: 'Are my contacts and data secure?',
    answer:
      'Absolutely. We use bank-level encryption for your contact database. Your data is stored securely in the cloud and is never shared with or sold to third parties.',
  },
  {
    question: 'Can I send bulk WhatsApp messages legally?',
    answer:
      'Yes, our WhatsApp integration uses the official WhatsApp Business API. You must ensure you have consent from the contacts to message them, in accordance with local data privacy laws (like GDPR or CAN-SPAM).',
  },
  {
    question: 'Can I upgrade or downgrade my plan at any time?',
    answer:
      'Yes, you can manage your subscription directly from your dashboard. Upgrades are applied instantly, while downgrades take effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens if I exceed my monthly scan limit?',
    answer:
      'On the Free and Pro plans, once you hit your limit, you can choose to upgrade your plan for higher limits or wait until your cycle resets for the next month.',
  },
]

export const FaqSection = () => {
  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border/50 py-2"
              >
                <AccordionTrigger className="text-left text-lg font-medium hover:text-primary transition-colors data-[state=open]:text-primary decoration-none">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
