"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { Sparkles, Mail, User, ArrowRight, Globe, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || name.trim().length < 2) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the terms");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.warning) {
          toast.success(`Demo signup! Use OTP: ${data.otp}`);
        } else {
          toast.success("Account initiated! Verification code sent to email.");
        }
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email)}&sent=true`);
        }, 800);
      } else {
        toast.error(data.error || "Failed to create account. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to connect. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      toast.error("Google signup initiation failed.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#06D6A0] via-[#059669] to-[#047857] items-center justify-center p-12">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-white/5 animate-float-1" />
        <div className="absolute -bottom-32 -left-32 w-[350px] h-[350px] rounded-full bg-white/5 animate-float-2" />
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-jakarta font-bold text-white">WishList</span>
          </div>
          <h1 className="font-jakarta text-3xl font-bold text-white mb-4">Start your investment journey today.</h1>
          <p className="text-white/70 text-lg">Free forever. No credit card needed.</p>
          <div className="mt-8 space-y-3 text-left">
            {["AI-powered investment strategies", "Track unlimited financial goals", "Real-time portfolio insights"].map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-white/90 text-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20"><Check className="h-3 w-3" /></div>
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-900">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-violet">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-jakarta font-bold text-text-primary">WishList</span>
          </div>

          <h2 className="font-jakarta text-2xl font-bold text-text-primary mb-2">Create your account</h2>
          <p className="text-text-muted mb-8">Start planning your financial future in 60 seconds</p>

          <GlassCard padding="lg">
            <div className="space-y-4">
              <div>
                <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" disabled={isLoading}
                    className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] pl-10 pr-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors placeholder:text-text-muted disabled:opacity-55" />
                </div>
              </div>
              <div>
                <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={isLoading}
                    className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] pl-10 pr-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors placeholder:text-text-muted disabled:opacity-55" />
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <button onClick={() => !isLoading && setAgreed(!agreed)} disabled={isLoading}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${agreed ? "bg-brand-primary border-brand-primary" : "border-white/[0.2]"} disabled:opacity-55`}>
                  {agreed && <Check className="h-3 w-3 text-white" />}
                </button>
                <span className="text-xs text-text-muted leading-relaxed select-none">
                  I agree to the <a href="#" className="text-brand-primary hover:underline">Terms of Service</a> and{" "}
                  <a href="#" className="text-brand-primary hover:underline">Privacy Policy</a>
                </span>
              </label>
              <motion.button whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: isLoading ? 1 : 0.98 }} onClick={handleRegister} disabled={isLoading}
                className="w-full gradient-cta text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-glow transition-shadow disabled:opacity-55">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
                <div className="relative flex justify-center"><span className="bg-surface-800 px-3 text-xs text-text-muted">OR</span></div>
              </div>
              <button onClick={handleGoogleLogin} disabled={isLoading}
                className="w-full border border-white/[0.08] text-text-primary font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-600/30 transition-colors disabled:opacity-55">
                <Globe className="h-4 w-4" /> Continue with Google
              </button>
            </div>
          </GlassCard>

          <p className="text-xs text-text-muted text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-primary hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
