"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Sync dark mode state with document element
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-border/40 py-3"
          : "bg-transparent border-transparent py-5",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text">
              ProctorAI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#home"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-border/40 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
              ) : (
                <Moon className="h-4 w-4 text-violet-500" />
              )}
            </button>

            {/* Login CTA */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 transition-all duration-200 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu Toggler */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-border/40 bg-card hover:bg-muted text-muted-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-violet-400" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 ease-in-out border-b border-border/40 bg-background/95 backdrop-blur-lg overflow-hidden",
          isOpen ? "max-h-64 opacity-100 py-4" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="px-4 space-y-3">
          <Link
            href="#home"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium hover:bg-muted transition-colors"
          >
            Home
          </Link>
          <Link
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium hover:bg-muted transition-colors"
          >
            Features
          </Link>
          <Link
            href="#about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium hover:bg-muted transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center px-4 py-2.5 text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/95 transition-all rounded-xl shadow-md"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
