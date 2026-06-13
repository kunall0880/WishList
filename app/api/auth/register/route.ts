import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: {
          email,
          name,
          plan: "FREE",
        },
      });
    } else {
      // Update name if not set
      await prisma.user.update({
        where: { email },
        data: { name: user.name || name },
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean old tokens for this email first
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Save token to database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    let warning = null;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Your Wishlist AI OTP Code",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #6C63FF; margin: 0; font-size: 28px;">WishList</h1>
                  <p style="color: #718096; margin: 5px 0 0 0;">Every dream deserves a financial plan.</p>
                </div>
                <div style="padding: 20px; border-top: 1px solid #edf2f7; border-bottom: 1px solid #edf2f7;">
                  <p style="font-size: 16px; margin: 0 0 16px 0;">Hello ${name || "there"},</p>
                  <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">Welcome to Wishlist AI! Use the verification code below to complete your registration. This code is valid for 10 minutes.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 4px; color: #6C63FF; background-color: #f7fafc; padding: 10px 24px; border-radius: 8px; border: 1px dashed #cbd5e0;">${otp}</span>
                  </div>
                  <p style="font-size: 14px; color: #718096; line-height: 1.5; margin: 0;">If you did not request this code, you can safely ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #a0aec0;">
                  &copy; ${new Date().getFullYear()} Wishlist AI. All rights reserved.
                </div>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("Resend API error on registration:", errText);
          warning = "Resend Sandbox limits. Using simulation OTP.";
        }
      } catch (err) {
        console.error("Failed to send Resend email:", err);
        warning = "Failed to dispatch email. Using simulation OTP.";
      }
    } else {
      warning = "Resend API key not configured. Using simulation OTP.";
    }

    return NextResponse.json({
      success: true,
      otp: warning ? "123456" : otp,
      warning,
    });
  } catch (error: any) {
    console.error("Registration route handler error:", error);
    return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
  }
}
