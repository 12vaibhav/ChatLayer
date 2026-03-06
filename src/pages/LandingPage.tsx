import React from 'react';
import { motion } from 'motion/react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { HowItWorksSticky } from '@/components/landing/HowItWorksSticky';
import { Testimonial } from '@/components/landing/Testimonial';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { Footer } from '@/components/landing/Footer';
import { Sparkles, Database, Code2, Users, BarChart3, ArrowRight, MessageSquare, Zap, CheckCircle2, Paintbrush, LineChart } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export default function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-coral-100 selection:text-coral-900">
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      
      <main>
        <Hero onSignup={onSignup} />

        {/* Features Section (Santr Inspired) */}
        <section id="features" className="relative w-full bg-[#FAFAFA] text-gray-900">
          {/* Sticky Layer */}
          <div className="lg:sticky lg:top-0 w-full lg:h-[70vh] flex flex-col items-center justify-center overflow-hidden pt-0 pb-10 lg:py-0">
            {/* Background Gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-coral-100/50 via-[#FAFAFA] to-[#FAFAFA]"></div>
            </div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0 pointer-events-none mix-blend-overlay"></div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-50 border border-coral-200 text-coral-600 text-sm font-bold uppercase tracking-widest mb-6 shadow-sm">
                  Powerful Features
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                  Everything you need to <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-orange-500">automate support.</span>
                </h2>
                <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
                  Grow your business without the complexity. Our AI agents handle the busywork so you can focus on building.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Scrolling Layer */}
          <div className="relative z-20 w-full max-w-6xl mx-auto px-4 pb-10 lg:pt-[30vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
              {[
                {
                  icon: Sparkles,
                  title: "Vibe Engine",
                  description: "Customize your bot's personality. Choose friendly, professional, or custom vibes to match your brand voice perfectly."
                },
                {
                  icon: Database,
                  title: "RAG Knowledge Base",
                  description: "Smart answers from your data. Upload FAQs, PDFs, or website links — bots pull accurate info instantly."
                },
                {
                  icon: Code2,
                  title: "Embeddable Widget",
                  description: "Seamless website integration. Add to any site with one code snippet; fully customizable and mobile-optimized."
                },
                {
                  icon: Users,
                  title: "Human Handoff",
                  description: "Escalate when needed. The bot detects frustration and hands off to your team smoothly via email or dashboard."
                },
                {
                  icon: BarChart3,
                  title: "Analytics Dashboard",
                  description: "Track performance. Get real-time insights on total chats, customer satisfaction rates, and common queries."
                },
                {
                  icon: ArrowRight,
                  title: "Tiered Pricing",
                  description: "Flexible plans that scale with you. From free basics to enterprise features, pay only for what you need."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index % 2 === 0 ? 0 : 0.1 }}
                  className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] hover:border-coral-300 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-coral-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-14 h-14 rounded-2xl bg-coral-50 flex items-center justify-center text-coral-500 mb-6 border border-coral-100 group-hover:bg-coral-500 group-hover:text-white transition-all duration-500">
                    <feature.icon size={28} className="transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-medium">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSticky />

        {/* Testimonials Section */}
        <Testimonial />

        {/* Pricing Section */}
        <PricingSection onSignup={onSignup} />

        {/* FAQ Section */}
        <section className="py-32 px-4 md:px-8 bg-[#FAFAFA] relative overflow-hidden">
          {/* Subtle top border gradient to separate from Pricing */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 font-medium">Everything you need to know about ChatLayer.</p>
            </div>
            <FAQAccordion />
          </div>
        </section>
      </main>

      <Footer onSignup={onSignup} />
    </div>
  );
}
