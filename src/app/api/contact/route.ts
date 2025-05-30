import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/server/email/send-email";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = contactSchema.parse(body);

    // Send contact form submission to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
      
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `Contact Form: ${subject}`,
          text: `New contact form submission:

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

---
Sent from Marathon Minimalist Contact Form
Date: ${new Date().toISOString()}`,
        });
      }

      // Send confirmation email to user
      await sendEmail({
        to: email,
        subject: "Thank you for contacting Marathon Minimalist",
        text: `Hi ${name},

Thank you for reaching out to us! We've received your message about "${subject}" and will get back to you as soon as possible.

Your message:
${message}

Best regards,
The Marathon Minimalist Team`,
      });
    } catch (emailError) {
      console.error("Failed to send contact form emails:", emailError);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Message sent successfully! We'll get back to you soon." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    
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