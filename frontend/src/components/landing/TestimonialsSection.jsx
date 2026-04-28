import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "UX Designer",
    text: "GigFlow completely transformed how I find clients. The AI matching is insanely accurate — I've tripled my income in just 6 months.",
    rating: 5,
    initials: "SM",
  },
  {
    name: "Alex Chen",
    role: "Startup Founder",
    text: "We built our entire MVP using GigFlow freelancers. The project management tools and secure payments made it a seamless experience.",
    rating: 5,
    initials: "AC",
  },
  {
    name: "Emily Torres",
    role: "Brand Strategist",
    text: "The quality of clients here is unmatched. I love the portfolio showcase feature — it speaks for itself and brings in premium projects.",
    rating: 5,
    initials: "ET",
  },
];

export function TestimonialsSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-primary/5 blur-[150px]" />

      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className={cn("text-center mb-16 transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-4">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-landing-foreground">
            Loved by <span className="text-gradient">thousands</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={cn(
                "glass rounded-3xl p-6 hover:bg-[hsl(0_0%_100%_/_0.08)] transition-all duration-500 group",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: visible ? `${i * 150}ms` : "0ms" }}
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-sm text-landing-foreground/70 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-landing-foreground">{t.name}</p>
                  <p className="text-xs text-landing-foreground/40">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
