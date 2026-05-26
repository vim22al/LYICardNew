import React from 'react'
import { Navbar } from './components/navbar'
import { HeroSection } from './components/hero-section'
import { HowItWorks } from './components/how-it-works'
import { FeaturesSection } from './components/features-section'
import { UseCases } from './components/use-cases'
import { PricingSection } from './components/pricing-section'
import { Testimonials } from './components/testimonials'
import { FaqSection } from './components/faq-section'
import { CtaSection } from './components/cta-section'
import { Footer } from './components/footer'

const Landing = () => {
  return (
    <div className="min-h-screen bg-background font-sans font-sans selection:bg-lagoon/20">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <UseCases />
        <PricingSection />
        <Testimonials />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

export default Landing
