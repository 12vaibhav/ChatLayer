import React from 'react';
import { motion } from 'motion/react';
import { PricingCard } from './PricingCard';

interface PricingSectionProps {
  onSignup: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSignup }) => {
  return (
    <section id="pricing" className="py-32 px-4 md:px-8 bg-[#FAFAFA] relative overflow-hidden perspective-[2000px]">
      {/* Deep Brand Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] via-coral-50/50 to-[#FAFAFA] pointer-events-none"></div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
      
      {/* Vibrant Coral/Orange Earth Curvature Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-coral-200/50 via-orange-100/30 to-transparent pointer-events-none rounded-[100%] blur-3xl opacity-80"></div>
      
      {/* Dynamic Mesh Gradients */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-coral-200/40 rounded-full blur-[128px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-orange-200/40 rounded-full blur-[128px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-coral-200/30 to-transparent blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-50 border border-coral-200 text-coral-600 text-sm font-bold uppercase tracking-widest mb-6 shadow-sm">
            Pricing
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
            Simple Pricing <br className="hidden md:block" /> For Every Business
          </h2>
          <p className="text-xl text-gray-600 font-medium">Transparent costs. No hidden fees.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0 }}
            className="z-0"
          >
            <PricingCard 
              name="Free"
              price="₹0"
              description="Perfect for trying it out."
              features={["1 Chatbot", "500 Chats/mo", "Basic Customization", "Email Support"]}
              ctaText="Start Free"
              onCtaClick={onSignup}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="z-20 relative"
          >
            <PricingCard 
              name="Starter"
              price="₹499"
              description="For growing small businesses."
              features={["3 Chatbots", "5,000 Chats/mo", "Remove Branding", "Priority Support", "Analytics"]}
              isPopular={true}
              ctaText="Start Trial"
              onCtaClick={onSignup}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="z-0"
          >
            <PricingCard 
              name="Growth"
              price="₹1,499"
              description="Scale without limits."
              features={["Unlimited Bots", "Unlimited Chats", "Advanced RAG", "Human Handoff", "API Access"]}
              ctaText="Contact Sales"
              onCtaClick={onSignup}
            />
          </motion.div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center text-gray-500 mt-16 text-sm font-medium"
        >
          All plans include a 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
};
