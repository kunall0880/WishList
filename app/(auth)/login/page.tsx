"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import { Sparkles, Mail, ArrowRight, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-provider";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Read URL params client-side without triggering Next.js suspense warnings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      const sentParam = params.get("sent");
      if (emailParam) {
        setEmail(emailParam);
      }
      if (sentParam === "true") {
        setOtpSent(true);
      }
    }
  }, []);

  const handleSendOTP = async () => {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        if (data.warning) {
          toast.success(`Demo Mode: Use OTP ${data.otp}`);
        } else {
          toast.success("OTP sent to your email!");
        }
      } else {
        toast.error(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to connect. Please check your network.");
    } finally {
      setIsSending(false);
    }
  };

  const handleOTPChange = async (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((d) => d) && newOtp.join("").length === 6) {
      setIsVerifying(true);
      const code = newOtp.join("");
      try {
        const res = await signIn("credentials", {
          email,
          otp: code,
          redirect: false,
        });

        if (res?.error) {
          toast.error("Invalid OTP code. Please try again.");
          setIsVerifying(false);
        } else {
          toast.success("Login successful! Redirecting...");
          // Fallback to update legacy auth state
          login(email, email.split("@")[0]);
          setTimeout(() => router.push("/dashboard"), 500);
        }
      } catch (err) {
        toast.error("An error occurred during verification.");
        setIsVerifying(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      toast.error("Google login initiation failed.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#6C63FF] via-[#5B52E0] to-[#4338CA] items-center justify-center p-12">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 animate-float-1" />
        <div className="absolute -bottom-32 -right-32 w-[350px] h-[350px] rounded-full bg-white/5 animate-float-2" />
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-jakarta font-bold text-white">WishList</span>
          </div>
          <h1 className="font-jakarta text-3xl font-bold text-white mb-4">Turn your dreams into an investment plan.</h1>
          <p className="text-white/70 text-lg">Join 50,000+ investors who plan smarter with AI.</p>
          <GlassCard padding="md" className="mt-8 text-left bg-white/5 border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#06D6A0] to-[#34D399] text-white text-sm font-bold flex-shrink-0">PM</div>
              <div>
                <p className="text-sm text-white/90 italic">&ldquo;WishList made retirement planning feel achievable for the first time.&rdquo;</p>
                <p className="text-xs text-white/50 mt-1">— Priya Menon, Doctor</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-900">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-violet">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-jakarta font-bold text-text-primary">WishList</span>
          </div>

          <h2 className="font-jakarta text-2xl font-bold text-text-primary mb-2">Welcome back</h2>
          <p className="text-text-muted mb-8">Sign in to continue to your dashboard</p>

          <GlassCard padding="lg">
            {!otpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="text-caption uppercase text-text-muted tracking-wider block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={isSending}
                      className="w-full rounded-xl bg-surface-600/50 border border-white/[0.06] pl-10 pr-4 py-3 text-sm text-text-primary focus:border-brand-primary/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors placeholder:text-text-muted disabled:opacity-55" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: isSending ? 1 : 1.02 }} whileTap={{ scale: isSending ? 1 : 0.98 }} onClick={handleSendOTP} disabled={isSending}
                  className="w-full gradient-cta text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-glow transition-shadow disabled:opacity-55">
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
                  <div className="relative flex justify-center"><span className="bg-surface-800 px-3 text-xs text-text-muted">OR</span></div>
                </div>
                <button onClick={handleGoogleLogin} disabled={isSending}
                  className="w-full border border-white/[0.08] text-text-primary font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-600/30 transition-colors disabled:opacity-55">
                  <Globe className="h-4 w-4" /> Continue with Google
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary text-center">Enter the 6-digit code sent to <span className="text-text-primary font-medium">{email}</span></p>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit} disabled={isVerifying}
                      onChange={(e) => handleOTPChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && i > 0) {
                          const prev = document.getElementById(`otp-${i - 1}`);
                          prev?.focus();
                        }
                      }}
                      className="h-12 w-12 rounded-xl bg-surface-600/50 border border-white/[0.06] text-center text-lg font-mono-numbers font-bold text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20 transition-colors disabled:opacity-55" />
                  ))}
                </div>
                {isVerifying && (
                  <div className="flex items-center justify-center gap-2 text-xs text-brand-primary font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying code...
                  </div>
                )}
                <button onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); }} disabled={isVerifying}
                  className="w-full text-xs text-text-muted hover:text-brand-primary transition-colors text-center py-2 disabled:opacity-55">
                  ← Use a different email
                </button>
              </div>
            )}
          </GlassCard>

          <p className="text-xs text-text-muted text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-primary hover:underline font-medium">Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
