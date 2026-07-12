"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Shield,
  Shuffle,
  Cpu,
  LayoutDashboard,
  Lock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
};

const hoverScaleVariants = {
  hover: {
    scale: 1.03,
    y: -8,
    boxShadow: "0 20px 40px -15px rgba(var(--primary-rgb), 0.15)",
    borderColor: "rgba(99, 102, 241, 0.45)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col relative overflow-x-hidden">
      {/* Background Gradients & Dynamic Mesh Grids */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)]" />
      <motion.div
        className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10"
        animate={{
          scale: [1, 1.1, 0.95, 1],
          opacity: [0.7, 0.9, 0.8, 0.7]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent/80 opacity-[0.05] rounded-full blur-3xl -z-10"
        animate={{
          scale: [0.95, 1.15, 1, 0.95],
          opacity: [0.05, 0.08, 0.06, 0.05]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Sections Wrapper */}
      <main className="flex-1 pt-24">
        
        {/* SECTION 1: HERO SECTION */}
        <section id="home" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative text-center">
          <div className="flex flex-col items-center">
            
            {/* Centered Content Stagger Actions */}
            <motion.div
              className="space-y-8 flex flex-col items-center max-w-3xl"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-md cursor-default hover:bg-primary/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                Vercel-Grade Quality & Security
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-foreground text-center"
              >
                ProctorAI <br />
                <span className="bg-gradient-to-r from-primary via-violet-500 to-accent bg-clip-text text-transparent">
                  AI-Powered Online Examination Platform
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed text-center"
              >
                ProctorAI is a secure AI-powered online examination platform featuring intelligent proctoring, automated evaluation, and comprehensive exam management.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex justify-center gap-4 pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 transition-all duration-200 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] group"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-card hover:bg-muted border border-border/40 transition-all rounded-xl hover:scale-[1.02]"
                >
                  Login
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: FEATURES SECTION */}
        <section id="features" className="bg-muted/20 border-y border-border/40 py-20 md:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Cutting-Edge Features for Academic Integrity
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Discover the robust tools engineered to deliver uncompromising exam security and automated grading capabilities.
              </p>
            </motion.div>

            {/* Grid of features */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "AI Proctoring",
                  desc: "Multi-modal face counting, gaze detection, and tab-switching monitoring flags session anomalies dynamically.",
                  icon: Brain,
                  color: "text-primary bg-primary/10 border-primary/20"
                },
                {
                  title: "Smart Question Bank",
                  desc: "Expose question configuration controls supporting MCQ, multi-select, short/long answers, and image attachments.",
                  icon: Shield,
                  color: "text-violet-500 bg-violet-500/10 border-violet-500/20"
                },
                {
                  title: "Randomized Exams",
                  desc: "Deterministic random paper generator seeds question orders per student ID, preventing candidate collusions.",
                  icon: Shuffle,
                  color: "text-accent bg-accent/10 border-accent/20"
                },
                {
                  title: "Automated Evaluation",
                  desc: "Intelligent evaluation tools grade candidate responses instantly, giving examiners immediate analytics.",
                  icon: Cpu,
                  color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                },
                {
                  title: "Examiner Dashboard",
                  desc: "Centralized workspaces to modify subjects, author exams, review snapshots, and manage evaluations.",
                  icon: LayoutDashboard,
                  color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
                },
                {
                  title: "Secure Authentication",
                  desc: "Strict JWT token binds with role authorizations, short-lived exam access tokens, and access middlewares.",
                  icon: Lock,
                  color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
                }
              ].map((feat, idx) => (
                <motion.div
                  key={idx}
                  className="p-6 rounded-2xl bg-card border border-border/30 flex flex-col gap-4 cursor-default select-none"
                  variants={hoverScaleVariants}
                  whileHover="hover"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                >
                  <div className={cn("p-3 w-fit rounded-xl border transition-transform duration-300", feat.color)}>
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS */}
        <section id="about" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Simplifying Secure Online Testing
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Follow our simple, highly protected 4-step workflow to configure and take examinations.
            </p>
          </motion.div>

          {/* Timeline steps */}
          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              {
                step: "01",
                title: "Login & Authenticate",
                desc: "Students register and login using strict JWT tokens, unlocking access permissions."
              },
              {
                step: "02",
                title: "Start Exam",
                desc: "Students verify credentials and enter using a short-lived exam session token."
              },
              {
                step: "03",
                title: "AI Monitoring",
                desc: "Integrated MediaPipe proctoring tracks faces and browser windows dynamically."
              },
              {
                step: "04",
                title: "Instant Results",
                desc: "Grading pipelines process responses and generate results immediately."
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="relative p-6 rounded-2xl bg-card border border-border/30 flex flex-col gap-3 group overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -8, borderColor: "rgba(99, 102, 241, 0.4)" }}
              >
                {/* Glow highlight */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="text-4xl font-extrabold text-primary/20 group-hover:text-primary/45 transition-colors font-mono">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{step.desc}</p>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-muted-foreground/30 animate-pulse">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* SECTION 6: FOOTER */}
      <footer className="border-t border-border/40 py-12 bg-card/45 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-bold text-lg">ProctorAI</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
              ProctorAI is a secure AI-powered online examination platform featuring intelligent proctoring, automated evaluation, and comprehensive exam management.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <Link href="#home" className="block hover:text-foreground hover:translate-x-1 transition-all">
                Home
              </Link>
              <Link href="#features" className="block hover:text-foreground hover:translate-x-1 transition-all">
                Features
              </Link>
              <Link href="#about" className="block hover:text-foreground hover:translate-x-1 transition-all">
                How It Works
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Contact Support</h4>
            <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              <p>Email: support@proctorai.com</p>
              <p>Phone: +1 (555) 902-1200</p>
              <p>Status: All Systems Operational</p>
            </div>
          </div>

          {/* GitHub links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Open Source</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <a
                href="https://github.com/RitikOnWork/AI-Proctored-Online-Examination-Platform-with-Intelligent-Performance-Evaluation"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center hover:text-foreground hover:translate-x-1 transition-all"
              >
                GitHub Repository
              </a>
              <p className="text-xs text-muted-foreground/60">
                Created under MIT License agreements.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ProctorAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
