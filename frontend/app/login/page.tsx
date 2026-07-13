"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  User,
  Info,
  KeyRound
} from "lucide-react";
import Link from "next/link";

// Zod Validation Schemas
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "examiner", "admin"]),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be under 128 characters"),
  role: z.enum(["student", "admin"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Forms Configuration
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "student",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const selectedLoginRole = loginForm.watch("role");
  const selectedRegisterRole = registerForm.watch("role");

  // Handle toast cleanup
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Form submit handler for LOGIN
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    // Step A. Attempt real FastAPI Database Authentication
    try {
      const loginParams = new URLSearchParams();
      loginParams.append("username", data.email);
      loginParams.append("password", data.password);

      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: loginParams,
      });

      if (res.ok) {
        const resData = await res.json();
        localStorage.setItem("access_token", resData.access_token);
        localStorage.setItem("refresh_token", resData.refresh_token);
        localStorage.setItem("user_role", data.role);
        localStorage.setItem("user_email", data.email);

        // Store cookies for server-side Next.js middleware compatibility
        const maxAge = data.rememberMe ? 60 * 60 * 24 * 7 : 3600; // 7 days or 1 hour
        document.cookie = `access_token=${resData.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
        document.cookie = `user_role=${data.role}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
        document.cookie = `user_email=${data.email}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

        setIsLoading(false);
        setToast({
          type: "success",
          message: `Successfully authenticated! Welcome to ProctorAI.`,
        });
        setTimeout(() => {
          router.push(`/${data.role}/dashboard`);
        }, 1500);
        return;
      }
    } catch (err) {
      console.warn("FastAPI connection failed, falling back to mock authentication:", err);
    }

    // Step B. Fallback mock authentication
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    let isValid = false;
    if (data.role === "student" && data.email === "student@gmail.com" && data.password === "student@123") {
      isValid = true;
    } else if (data.role === "examiner" && data.email === "examiner@gmail.com" && data.password === "examiner@123") {
      isValid = true;
    } else if (data.role === "admin" && data.email === "admin@gmail.com" && data.password === "admin@123") {
      isValid = true;
    }

    if (!isValid) {
      setToast({
        type: "error",
        message: `Invalid credentials for the ${data.role.toUpperCase()} role. Please verify your inputs.`,
      });
    } else {
      const mockAccessToken = "mock_access_token_" + data.role;
      const mockRefreshToken = "mock_refresh_token_" + data.role;
      
      localStorage.setItem("access_token", mockAccessToken);
      localStorage.setItem("refresh_token", mockRefreshToken);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_email", data.email);

      // Set cookies for mock login path
      const maxAge = data.rememberMe ? 60 * 60 * 24 * 7 : 3600;
      document.cookie = `access_token=${mockAccessToken}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
      document.cookie = `user_role=${data.role}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
      document.cookie = `user_email=${data.email}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

      setToast({
        type: "success",
        message: `Mock login successful as ${data.role.toUpperCase()}! Redirecting...`,
      });
      setTimeout(() => {
        router.push(`/${data.role}/dashboard`);
      }, 1500);
    }
  };

  // Form submit handler for REGISTRATION
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setToast({
          type: "success",
          message: "Account created successfully! You can now log in.",
        });
        // Switch to login tab and prefill email
        setIsRegister(false);
        loginForm.setValue("email", data.email);
        loginForm.setValue("role", data.role);
      } else {
        setToast({
          type: "error",
          message: resData.detail || "Registration failed. Please check your details.",
        });
      }
    } catch (err) {
      setIsLoading(false);
      setToast({
        type: "error",
        message: "Unable to connect to the backend server. Verify the API is running.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground relative overflow-hidden">
      {/* Back button to Home */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="absolute top-6 left-6 z-50"
      >
        <Link
          href="/"
          className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-card/65 backdrop-blur-md px-4 py-2 rounded-xl border border-border/40 hover:scale-105 transform duration-150"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* Main Split Layout */}
      <div className="w-full grid lg:grid-cols-12">
        
        {/* Left Side - Geometric Branding (Slide in from Left) */}
        <motion.div
          className="hidden lg:flex lg:col-span-5 relative bg-muted items-center justify-center p-12 overflow-hidden border-r border-border/30"
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-background to-accent/20" />
          <motion.div
            className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.9, 0.7] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          />
          <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          {/* Logo & Content details */}
          <div className="relative z-10 space-y-8 max-w-md text-left">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="p-3 bg-primary/15 rounded-2xl border border-primary/25">
                <Shield className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight">ProctorAI</span>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                Secure Examinations Powered by Real-Time AI.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                ProctorAI is a secure AI-powered online examination platform featuring intelligent proctoring, automated evaluation, and comprehensive exam management.
              </p>
            </div>

            <div className="border-t border-border/40 pt-6 space-y-3">
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-muted-foreground font-semibold">Webcam Monitor Ready</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-muted-foreground font-semibold">Browser Lockdown Mode Enabled</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form Card (Slide in from Right) */}
        <motion.div
          className="col-span-12 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-20 relative bg-background"
          initial={{ x: 150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        >
          <div className="w-full max-w-[440px] space-y-6">
            
            {/* Form Header */}
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isRegister ? "Create an Account" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {isRegister 
                  ? "Create a Student or Admin account. Examiner accounts are provisioned by the Admin." 
                  : "Enter your credentials below to access your account workspace."}
              </p>
            </div>

            {/* Form Card with Morph Transition */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="border border-border/40 rounded-2xl bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-md"
            >
              <AnimatePresence mode="wait">
                {isRegister ? (
                  
                  /* RENDER REGISTRATION FORM */
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-4"
                  >
                    {/* Name Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                          <User className="h-4.5 w-4.5" />
                        </div>
                        <input
                          {...registerForm.register("full_name")}
                          type="text"
                          placeholder="John Doe"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                            registerForm.formState.errors.full_name ? "border-destructive focus:ring-destructive/20" : "border-border/45 focus:border-primary"
                          }`}
                        />
                      </div>
                      {registerForm.formState.errors.full_name && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {registerForm.formState.errors.full_name.message}
                        </p>
                      )}
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <input
                          {...registerForm.register("email")}
                          type="email"
                          placeholder="name@example.com"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                            registerForm.formState.errors.email ? "border-destructive focus:ring-destructive/20" : "border-border/45 focus:border-primary"
                          }`}
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                        <input
                          {...registerForm.register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 8 characters"
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                            registerForm.formState.errors.password ? "border-destructive focus:ring-destructive/20" : "border-border/45 focus:border-primary"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/60 hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Role Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-primary" />
                        Select Account Role
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "student", label: "🎓 Student" },
                          { value: "admin", label: "🛡️ Admin" },
                        ].map((roleOption) => (
                          <button
                            key={roleOption.value}
                            type="button"
                            onClick={() => registerForm.setValue("role", roleOption.value as any)}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              selectedRegisterRole === roleOption.value
                                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10 scale-[1.02]"
                                : "bg-muted/40 text-muted-foreground border-border/30 hover:bg-muted/70 hover:text-foreground"
                            }`}
                          >
                            {roleOption.label}
                          </button>
                        ))}
                      </div>

                      {/* Examiner Account Notice */}
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3.5 py-3"
                      >
                        <div className="mt-0.5 shrink-0 p-1 rounded-lg bg-amber-500/15">
                          <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            Examiner accounts are not self-registerable
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Examiner credentials are created manually by the <span className="font-semibold text-foreground/70">Admin</span> and sent directly to the assigned Examiner via email or secure channel.
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Register Button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 disabled:bg-primary/60 transition-all duration-200 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </motion.button>
                  </motion.form>
                ) : (
                  
                  /* RENDER LOGIN FORM */
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-5"
                  >
                    {/* Demo Role Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-primary" />
                        Role (Demo Mode Selector)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "student", label: "Student" },
                          { value: "examiner", label: "Examiner" },
                          { value: "admin", label: "Admin" },
                        ].map((roleOption) => (
                          <button
                            key={roleOption.value}
                            type="button"
                            onClick={() => loginForm.setValue("role", roleOption.value as any)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              selectedLoginRole === roleOption.value
                                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10"
                                : "bg-muted/40 text-muted-foreground border-border/30 hover:bg-muted/70 hover:text-foreground"
                            }`}
                          >
                            {roleOption.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <input
                          {...loginForm.register("email")}
                          type="email"
                          placeholder="name@example.com"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                            loginForm.formState.errors.email ? "border-destructive focus:ring-destructive/20" : "border-border/45 focus:border-primary"
                          }`}
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground">Password</label>
                        <Link
                          href="#"
                          className="text-xs font-semibold text-primary hover:underline transition-all"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                        <input
                          {...loginForm.register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                            loginForm.formState.errors.password ? "border-destructive focus:ring-destructive/20" : "border-border/45 focus:border-primary"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/60 hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center space-x-2">
                      <input
                        {...loginForm.register("rememberMe")}
                        type="checkbox"
                        id="rememberMe"
                        className="h-4 w-4 rounded border-border/40 bg-background/50 text-primary focus:ring-primary focus:ring-offset-background"
                      />
                      <label htmlFor="rememberMe" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                        Remember me on this device
                      </label>
                    </div>

                    {/* Submit button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/95 disabled:bg-primary/60 transition-all duration-200 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Toggle Login/Register */}
            <p className="text-center text-xs text-muted-foreground">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setShowPassword(false);
                }}
                className="font-semibold text-primary hover:underline focus:outline-none"
              >
                {isRegister ? "Sign In here" : "Create Account"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating Toast Notification Box */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 max-w-sm"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className={`p-4 rounded-xl border shadow-xl flex items-start space-x-3 backdrop-blur-md ${
              toast.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-destructive/10 border-destructive/20 text-destructive-600 dark:text-destructive-400"
            }`}>
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  {toast.type === "success" ? "System Notification" : "Authentication Alert"}
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
