import { Link } from "react-router-dom";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "API"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Documentation", "Help Center", "Community", "Status"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

export function Footer() {
  return (
    <footer className="relative border-t border-landing-foreground/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-1">
            <Link to="/" className="text-xl font-bold">
              <span className="text-gradient">Gig</span>
              <span className="text-landing-foreground">Flow</span>
            </Link>
            <p className="mt-3 text-sm text-landing-foreground/40 max-w-xs">
              The future of freelancing. Connect, collaborate, and grow.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-landing-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-landing-foreground/40 hover:text-landing-foreground/70 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-landing-foreground/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-landing-foreground/30">© 2024 GigFlow. All rights reserved.</p>
          <div className="flex gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a key={social} href="#" className="text-xs text-landing-foreground/30 hover:text-landing-foreground/60 transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
