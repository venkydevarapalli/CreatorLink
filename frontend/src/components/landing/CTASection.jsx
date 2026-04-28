import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="relative py-24">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className={cn(
          "relative rounded-3xl overflow-hidden transition-all duration-700",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* Background */}
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary-foreground/5 blur-[80px]" />

          <div className="relative text-center py-16 sm:py-20 px-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary-foreground tracking-tight">
              Ready to Transform
              <br />
              Your Career?
            </h2>
            <p className="mt-4 text-primary-foreground/70 max-w-lg mx-auto">
              Join thousands of professionals who've already leveled up their freelancing game with GigFlow.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="group inline-flex items-center justify-center gap-2 bg-primary-foreground text-primary font-semibold px-8 py-4 rounded-2xl text-sm hover:bg-primary-foreground/90 transition-all"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 border border-primary-foreground/20 text-primary-foreground/80 hover:text-primary-foreground font-medium px-8 py-4 rounded-2xl text-sm transition-colors hover:bg-primary-foreground/5"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
