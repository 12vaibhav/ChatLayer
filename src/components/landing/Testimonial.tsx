import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Quote, MessageSquare } from 'lucide-react';

export const Testimonial = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Calculate scroll range dynamically on mount and resize
  useEffect(() => {
    const updateScrollRange = () => {
      if (scrollRef.current) {
        const totalWidth = scrollRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        // Scroll enough to show the last card with some padding
        setScrollRange(totalWidth - viewportWidth);
      }
    };

    updateScrollRange();
    window.addEventListener('resize', updateScrollRange);
    return () => window.removeEventListener('resize', updateScrollRange);
  }, []);

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange]);

  const testimonials = [
    {
      quote: "Compliance was our biggest worry when automating support. ChatLayer's secure infrastructure and precise RAG implementation gave us the confidence to deploy instantly.",
      author: "Priya Kumar",
      role: "CTO at MedTech Solutions",
      avatarUrl: "https://i.pravatar.cc/150?u=priya",
      companyLogo: <div className="flex items-center gap-1 font-bold text-sm"><MessageSquare size={16} /> MedTech</div>
    },
    {
      quote: "ChatLayer has completely transformed lead qualification. The AI updates CRM records in real time and generates pipeline reports automatically. We closed 27% more deals last quarter.",
      author: "Sophie Mooree",
      role: "VP Sales at Conver",
      avatarUrl: "https://i.pravatar.cc/150?u=sophie",
      companyLogo: <div className="flex items-center gap-1 font-bold text-sm"><MessageSquare size={16} /> Conver</div>
    },
    {
      quote: "Seamless integration. We plugged it into our existing Zendesk setup in under 10 minutes. Our agent productivity went up 25% in the first week alone.",
      author: "James Randee",
      role: "Head of Support at CloudFlow",
      avatarUrl: "https://i.pravatar.cc/150?u=james",
      companyLogo: <div className="flex items-center gap-1 font-bold text-sm"><MessageSquare size={16} /> CloudFlow</div>
    },
    {
      quote: "The customization options are endless. We built a bot that sounds exactly like our brand voice—witty, helpful, and professional. Our customers love it.",
      author: "Michael Chen",
      role: "Founder at Artistry",
      avatarUrl: "https://i.pravatar.cc/150?u=michael",
      companyLogo: <div className="flex items-center gap-1 font-bold text-sm"><MessageSquare size={16} /> Artistry</div>
    },
    {
      quote: "Setup was incredibly easy. We were up and running in an afternoon. The analytics dashboard gives us insights we never had before.",
      author: "Sarah Jenkins",
      role: "COO at LogisticsNow",
      avatarUrl: "https://i.pravatar.cc/150?u=sarah",
      companyLogo: <div className="flex items-center gap-1 font-bold text-sm"><MessageSquare size={16} /> LogisticsNow</div>
    },
    {
      quote: "Best investment we made this year. It handles 80% of our support volume, allowing our team to focus on complex issues. Highly recommended.",
      author: "David Wilson",
      role: "Head of CX at FinServe",
      avatarUrl: "https://i.pravatar.cc/150?u=david",
      companyLogo: <div className="flex items-center gap-1 font-bold text-sm"><MessageSquare size={16} /> FinServe</div>
    }
  ];

  return (
    <section ref={targetRef} className="relative h-[250vh] bg-[#FAFAFA] py-16">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-coral-100/50 via-[#FAFAFA] to-[#FAFAFA]"></div>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0 pointer-events-none mix-blend-overlay"></div>

        {/* Header */}
        <div className="relative z-10 text-center mb-10 px-4">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
            Teams Trust <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-500 via-orange-500 to-coral-600">ChatLayer To Deliver</span>
            <br />
            More Everyday
          </h2>
        </div>

        {/* Horizontal Scroll Area */}
        <div className="relative z-20 w-full overflow-hidden py-4">
          <motion.div 
            ref={scrollRef}
            style={{ x }} 
            className="flex gap-6 md:gap-8 px-[5vw] w-max"
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="w-[85vw] md:w-[50vw] lg:w-[35vw] shrink-0 relative bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:border-coral-300 transition-all duration-700 group overflow-hidden flex flex-col"
              >
                {/* Subtle inner top highlight */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-coral-300/40 to-transparent"></div>
                
                {/* Header: Avatar & Company */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                      <img src={testimonial.avatarUrl} alt={testimonial.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900 tracking-wide">{testimonial.author}</p>
                      <p className="text-sm text-coral-600 font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    {testimonial.companyLogo}
                  </div>
                </div>

                {/* Quote Content */}
                <div className="flex-1 relative mt-4">
                  <Quote className="absolute -top-6 -left-4 w-12 h-12 text-gray-100 rotate-180" />
                  <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed relative z-10">
                    "{testimonial.quote}"
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
