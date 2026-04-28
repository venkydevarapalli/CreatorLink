import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { Briefcase, Shield, Zap, MessageSquare, BarChart3, Globe } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Matching",
    description: "AI-powered algorithm connects you with the perfect freelancer in seconds, not days.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Shield,
    title: "Secure Escrow Payments",
    description: "Your funds are protected with bank-grade security until the work is delivered and approved.",
    gradient: "from-accent to-info",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Collaboration",
    description: "Built-in messaging, file sharing, and video calls keep your projects moving forward.",
    gradient: "from-success to-accent",
  },
  {
    icon: Briefcase,
    title: "Smart Project Management",
    description: "Track milestones, deadlines, and deliverables with our intuitive project dashboard.",
    gradient: "from-warning to-primary",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Gain insights into your performance, earnings, and growth with detailed reports.",
    gradient: "from-primary to-success",
  },
  {
    icon: Globe,
    title: "Global Talent Pool",
    description: "Access verified freelancers from 150+ countries with specialized skill sets.",
    gradient: "from-info to-primary",
  },
];

export function FeaturesSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-primary/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/5 blur-[120px]" />

      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className={cn("text-center mb-16 transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-landing-foreground">
            Everything you need to <span className="text-gradient">succeed</span>
          </h2>
          <p className="mt-4 text-landing-foreground/40 max-w-2xl mx-auto">
            Powerful tools designed to streamline your freelancing workflow from start to finish.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={cn(
                "group relative glass rounded-3xl p-6 hover:bg-[hsl(0_0%_100%_/_0.08)] transition-all duration-500 hover:-translate-y-1",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: visible ? `${i * 100}ms` : "0ms" }}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-landing-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-landing-foreground/40 leading-relaxed">{feature.description}</p>
              
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ boxShadow: "inset 0 0 60px hsl(252 87% 58% / 0.05)" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
