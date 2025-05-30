import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/server/email/send-email";

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = newsletterSchema.parse(body);

    // Send welcome email and notification to admin
    try {
      // Send welcome email to subscriber
      await sendEmail({
        to: email,
        subject: "Welcome to Marathon Minimalist Newsletter!",
        react: undefined, // We'll use text for now
        text: `Hi ${name || "there"},

Thank you for subscribing to our newsletter! You'll receive updates about:

• Training tips and strategies
• Marathon preparation guides  
• App updates and new features
• Success stories from our community

Happy running!
The Marathon Minimalist Team`,
      });

      // Send notification to admin (optional)
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "New Newsletter Subscription",
          text: `New newsletter subscription:
Email: ${email}
Name: ${name || "Not provided"}
Date: ${new Date().toISOString()}`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send newsletter emails:", emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 