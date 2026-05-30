import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl backdrop-saturate-180 border-b border-white/50 shadow-sm shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group select-none hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/MeroPaaloLogo.png"
            alt="MeroPaalo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-display font-bold text-slate-900 text-lg tracking-tight hidden sm:inline">
            Mero<span className="text-teal-600">Paalo</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Log in
          </Link>
          <a
            href="#"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-px"
          >
            Request Demo <ArrowRight size={14} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/70 backdrop-blur-xl border-t border-slate-100 px-6 py-5 flex flex-col gap-4 animate-fade-in">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-teal-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Log in
            </Link>
            <a
              href=""
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-md shadow-teal-500/25"
            >
              Request Demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
