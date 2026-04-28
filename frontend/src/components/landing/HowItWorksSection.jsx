import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { Search, UserCheck, Handshake, Rocket } from "lucide-react";

const steps = [
  { icon: Search, title: "Post Your Gig", description: "Describe your project, set a budget, and let our AI match you with the best talent.", number: "01" },
  { icon: UserCheck, title: "Review Proposals", description: "Compare bids, portfolios, and ratings to find your perfect freelancer.", number: "02" },
  { icon: Handshake, title: "Collaborate Securely", description: "Work together with built-in tools, milestone tracking, and secure payments.", number: "03" },
  { icon: Rocket, title: "Launch & Grow", description: "Receive your completed project, leave a review, and scale your business.", number: "04" },
];

export function HowItWorksSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden lg:block" />

      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className={cn("text-center mb-16 transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">How it Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-landing-foreground">
            Simple. Fast. <span className="text-gradient">Powerful.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={cn(
                "relative text-center group transition-all duration-700",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: visible ? `${i * 150}ms` : "0ms" }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <div className="relative inline-flex mb-5">
                <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center group-hover:glow-primary transition-all duration-300">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-landing-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-landing-foreground/40 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
