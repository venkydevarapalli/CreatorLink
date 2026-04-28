import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for getting started",
    features: ["5 gig postings/month", "Basic matching", "Standard support", "Community access"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious freelancers",
    features: ["Unlimited gig postings", "AI-powered matching", "Priority support", "Analytics dashboard", "Custom portfolio", "Verified badge"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For teams and agencies",
    features: ["Everything in Pro", "Team management", "API access", "Dedicated account manager", "Custom integrations", "SLA guarantee"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function PricingSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 w-96 h-96 rounded-full bg-accent/5 blur-[150px] -translate-x-1/2" />

      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className={cn("text-center mb-16 transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">Pricing</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-landing-foreground">
            Plans that <span className="text-gradient">scale with you</span>
          </h2>
          <p className="mt-4 text-landing-foreground/40 max-w-xl mx-auto">No hidden fees. Cancel anytime. Start free and upgrade as you grow.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-3xl p-6 transition-all duration-700",
                plan.highlighted
                  ? "glass-strong glow-primary scale-[1.02]"
                  : "glass hover:bg-[hsl(0_0%_100%_/_0.06)]",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: visible ? `${i * 150}ms` : "0ms" }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-primary-foreground text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-landing-foreground">{plan.name}</h3>
                <p className="text-xs text-landing-foreground/40 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black text-landing-foreground">{plan.price}</span>
                <span className="text-sm text-landing-foreground/40">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-landing-foreground/60">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/dashboard"
                className={cn(
                  "block text-center text-sm font-semibold py-3 rounded-xl transition-all",
                  plan.highlighted
                    ? "gradient-primary text-primary-foreground glow-primary hover:opacity-90"
                    : "glass text-landing-foreground hover:bg-[hsl(0_0%_100%_/_0.1)]"
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
