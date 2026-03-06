import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "border-b border-gray-200 overflow-hidden transition-colors duration-300",
      isOpen ? "bg-gray-50" : "hover:bg-gray-50/50"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-6 flex items-center justify-between text-left group"
      >
        <span className="font-bold text-gray-900 text-lg tracking-wide group-hover:text-coral-600 transition-colors">{question}</span>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border",
          isOpen 
            ? "bg-coral-500 border-coral-500 text-white rotate-180" 
            : "bg-transparent border-gray-300 text-gray-400 group-hover:border-coral-400 group-hover:text-coral-500"
        )}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-gray-600 leading-relaxed font-medium">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQAccordion = () => {
  const faqs = [
    {
      question: "How easy is setup?",
      answer: "It takes less than 5 minutes. Just create an account, customize your bot's personality, and paste a single line of code onto your website. No technical skills required!"
    },
    {
      question: "What integrations do you support?",
      answer: "We currently support integration with any website (WordPress, Shopify, Wix, etc.). Direct integrations with Slack, WhatsApp, and Messenger are coming soon."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We are fully GDPR-compliant and use enterprise-grade encryption to ensure your business and customer data is always protected."
    },
    {
      question: "Can I switch plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto border-t border-gray-200">
      {faqs.map((faq, i) => (
        <FAQItem key={i} {...faq} />
      ))}
    </div>
  );
};
