import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import dashboardMockup from "@/assets/dashboard-mockup.png";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-landing-bg/80 via-landing-bg/60 to-landing-bg" />
        <div className="absolute inset-0 grid-pattern" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-[120px] animate-pulse-glow delay-500" />

      {/* Particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40 animate-particle"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 1.2}s`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-landing-foreground/80">
                Trusted by 10,000+ Creators,Brands worldwide
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight animate-slide-up delay-100">
              <span className="text-landing-foreground">Creator Link</span>
              <br />
              <span className="text-gradient text-glow">Where creators</span>
              <br />
              <span className="text-landing-foreground">connect</span>
            </h1>

            <p className="text-base sm:text-lg text-landing-foreground/50 max-w-lg leading-relaxed animate-slide-up delay-200">
              Connect with top talent, manage projects seamlessly, and grow your business
              with the most advanced freelance marketplace platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-300">
              <Link
                to="/dashboard"
                className="group inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground font-semibold px-8 py-4 rounded-2xl text-sm hover:opacity-90 transition-all glow-primary hover:shadow-[0_0_40px_hsl(252_87%_58%_/_0.4)]"
              >
                Start your journey
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group inline-flex items-center justify-center gap-2 glass text-landing-foreground/80 hover:text-landing-foreground font-medium px-8 py-4 rounded-2xl text-sm transition-all hover:bg-[hsl(0_0%_100%_/_0.08)]">
                <span className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Play className="h-3 w-3 fill-primary-foreground text-primary-foreground ml-0.5" />
                </span>
                Watch Demo
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 animate-slide-up delay-400">
              <div className="flex -space-x-2">
                {["SM", "AK", "ET", "DL", "JW"].map((init) => (
                  <div key={init} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground ring-2 ring-landing-bg">
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-warning text-warning" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-landing-foreground/40">4.9/5 from 2,000+ reviews</p>
              </div>
            </div>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="relative hidden lg:block animate-slide-up delay-300">
            <div className="relative animate-float-slow">
              <div className="absolute -inset-8 gradient-hero rounded-3xl blur-[60px] opacity-20" />
              <img
                src={dashboardMockup}
                alt="GigFlow Dashboard"
                className="relative w-full max-w-lg mx-auto drop-shadow-2xl"
                width={1024}
                height={1024}
              />
            </div>
            {/* Floating stat cards */}
            <div className="absolute -left-4 top-1/4 glass-strong rounded-2xl p-3 animate-float delay-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">↑</div>
                <div>
                  <p className="text-xs font-semibold text-landing-foreground">+24%</p>
                  <p className="text-[10px] text-landing-foreground/40">Revenue</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-1/3 glass-strong rounded-2xl p-3 animate-float delay-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-success/20 flex items-center justify-center text-xs font-bold text-success">✓</div>
                <div>
                  <p className="text-xs font-semibold text-landing-foreground">98%</p>
                  <p className="text-[10px] text-landing-foreground/40">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-landing-bg to-transparent" />
    </section>
  );
}
