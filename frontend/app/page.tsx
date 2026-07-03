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
  Sparkles,
  Users,
  Award,
  Zap,
  CheckCircle2,
  Terminal,
  Activity
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
        <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Stagger Actions */}
            <motion.div
              className="lg:col-span-7 space-y-6 text-left"
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
                className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-foreground"
              >
                AI-Proctored Online <br />
                <span className="bg-gradient-to-r from-primary via-violet-500 to-accent bg-clip-text text-transparent">
                  Examination Platform
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
              >
                Conduct secure, high-fidelity examinations from anywhere. Empowered by multi-modal AI gaze detection, browser locks, and automated performance evaluation.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
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

            {/* Right Side: Continuous Floating Console Mockup */}
            <motion.div
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Soft background glow */}
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl -z-10" />
              
              {/* Floating Wrapper */}
              <motion.div
                className="relative border border-border/40 rounded-2xl bg-card/65 backdrop-blur-md p-6 flex flex-col gap-6 shadow-2xl"
                animate={{
                  y: [0, -12, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-semibold text-foreground text-xs sm:text-sm">Proctor Telemetry Console</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono uppercase tracking-wide">
                    Live Session Active
                  </span>
                </div>

                {/* Grid Status */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Gaze Tracking", value: "Centered (98.4%)", color: "text-primary", icon: Activity },
                    { title: "Browser Guard", value: "Locked (Tabs: 0)", color: "text-violet-500", icon: Cpu },
                    { title: "Face Count", value: "1 Active Candidate", color: "text-accent", icon: Users },
                    { title: "AI Evaluation", value: "Evaluating", color: "text-emerald-500", icon: Terminal }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-muted/30 border border-border/20 rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors hover:bg-muted/50"
                      whileHover={{ scale: 1.04 }}
                    >
                      <div className="text-muted-foreground text-xs flex items-center gap-1.5 font-medium">
                        <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                        {stat.title}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-foreground">{stat.value}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Notification */}
                <motion.div 
                  className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-foreground/80 leading-relaxed">
                    <strong>Real-time proctoring:</strong> Deep learning networks monitor candidate compliance dynamically.
                  </div>
                </motion.div>
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

        {/* SECTION 4: STATISTICS SECTION */}
        <section className="bg-primary/5 py-16 border-y border-primary/10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {[
              { label: "Students Served", value: "1,000+" },
              { label: "Exams Managed", value: "100+" },
              { label: "Secure Sessions", value: "99.9%" },
              { label: "Evaluation Mode", value: "AI Powered" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center space-y-2"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 12, delay: idx * 0.08 }}
              >
                <motion.div 
                  className="text-3xl sm:text-5xl font-extrabold text-primary font-mono tracking-tight"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: idx * 0.5 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 5: TECHNOLOGY STACK */}
        <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-foreground">Engineered with Modern Technologies</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Our microservice platform leverages top-tier frameworks and libraries to deliver high throughput and low-latency validation.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {[
              "FastAPI",
              "Next.js 15",
              "PostgreSQL",
              "MediaPipe",
              "TensorFlow.js",
              "OpenAI API",
              "TypeScript",
              "Tailwind CSS",
              "SQLAlchemy 2.0",
              "Framer Motion"
            ].map((tech, idx) => (
              <motion.span
                key={idx}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-border/40 bg-card text-foreground cursor-default select-none shadow-sm hover:border-primary/45 transition-colors"
                whileHover={{ scale: 1.08, rotate: [0, 1.5, -1.5, 0] }}
                transition={{ duration: 0.2 }}
              >
                {tech}
              </motion.span>
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
              <span className="font-bold text-lg">VeriExam.AI</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
              AI-Proctored Online Examination Platform securing academic integrity and evaluation services globally.
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
              <p>Email: support@veriexam.ai</p>
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
          <p>© {new Date().getFullYear()} VeriExam.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
