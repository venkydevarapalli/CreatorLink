import { useCountUp } from "@/hooks/use-count-up";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const stats = [
  { value: 50000, suffix: "+", label: "Freelancers", description: "Active professionals" },
  { value: 12000, suffix: "+", label: "Projects Done", description: "Successfully delivered" },
  { value: 98, suffix: "%", label: "Satisfaction", description: "Client satisfaction rate" },
  { value: 150, suffix: "+", label: "Countries", description: "Global reach" },
];

export function StatsSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="relative py-20">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className={cn(
          "relative glass-strong rounded-3xl p-8 sm:p-12 overflow-hidden transition-all duration-700",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Background accent */}
          <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatItem key={stat.label} stat={stat} delay={i * 150} visible={visible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ stat, delay, visible }) {
  const { count, ref } = useCountUp(stat.value, 2000);

  return (
    <div
      ref={ref}
      className={cn(
        "text-center transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-gradient">
        {count.toLocaleString()}{stat.suffix}
      </p>
      <p className="text-sm font-semibold text-landing-foreground mt-2">{stat.label}</p>
      <p className="text-xs text-landing-foreground/40 mt-0.5">{stat.description}</p>
    </div>
  );
}
