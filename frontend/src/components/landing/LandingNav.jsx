import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong py-3" : "py-5"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          <span className="text-gradient">Gig</span>
          <span className="text-landing-foreground">Flow</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-landing-foreground/60 hover:text-landing-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/dashboard" className="text-sm text-landing-foreground/70 hover:text-landing-foreground px-4 py-2 transition-colors">
            Log in
          </Link>
          <Link
            to="/dashboard"
            className="text-sm font-medium gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity glow-primary"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-landing-foreground">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden glass-strong mt-2 mx-4 rounded-2xl p-4 animate-scale-in">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="block py-2.5 text-sm text-landing-foreground/70 hover:text-landing-foreground">
              {link.label}
            </a>
          ))}
          <Link to="/dashboard" className="block mt-3 text-center text-sm font-medium gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl">
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}
