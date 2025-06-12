"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";
import { CustomButton } from "@/components/CustomButton";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterSignupProps {
  className?: string;
  variant?: "default" | "minimal" | "hero";
}

export default function NewsletterSignup({ 
  className = "", 
  variant = "default" 
}: NewsletterSignupProps) {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    try {
      const validatedData = newsletterSchema.parse(formData);
      
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(result.message);
        setFormData({ email: "", name: "" });
      } else {
        setStatus("error");
        setMessage(result.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      if (error instanceof z.ZodError) {
        setMessage(error.errors[0]?.message || "Please check your input");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewsletterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
  };

  if (variant === "minimal") {
    return (
      <div className={`${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-background focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            required
          />
          <CustomButton
            type="submit"
            disabled={isLoading || !formData.email}
            loading={isLoading}
            variant="filled"
          >
            Subscribe
          </CustomButton>
        </form>
        {message && (
          <p className={`mt-2 body-small ${status === "success" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <motion.div 
        className={`card-enhanced p-8 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-6">
          <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="heading-3 mb-2">Stay Updated</h3>
          <p className="body-medium text-muted-foreground">
            Get the latest training tips and app updates delivered to your inbox
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="px-4 py-3 rounded-lg bg-background focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <input
              type="email"
              placeholder="Your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="px-4 py-3 rounded-lg bg-background focus:ring-2 focus:ring-primary"
              disabled={isLoading}
              required
            />
          </div>
          
          <CustomButton
            type="submit"
            disabled={isLoading || !formData.email}
            loading={isLoading}
            variant="filled"
            className="w-full"
          >
            Subscribe to Newsletter
          </CustomButton>
        </form>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              status === "success" 
                ? "bg-green-500/10 text-green-600" 
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="body-small">{message}</span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div 
      className={`card-enhanced p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-6">
        <Mail className="h-10 w-10 mx-auto mb-3 text-primary" />
        <h3 className="heading-4 mb-2">
          Join Our Newsletter
        </h3>
        <p className="body-medium text-muted-foreground">
          Get training tips, app updates, and marathon insights delivered weekly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-background focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <input
          type="email"
          placeholder="Your email address"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-background focus:ring-2 focus:ring-primary"
          disabled={isLoading}
          required
        />
        
        <CustomButton
          type="submit"
          disabled={isLoading || !formData.email}
          loading={isLoading}
          variant="filled"
          className="w-full"
        >
          Subscribe to Newsletter
        </CustomButton>
      </form>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            status === "success" 
              ? "bg-green-500/10 text-green-600" 
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {status === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="body-small">{message}</span>
        </motion.div>
      )}
    </motion.div>
  );
} 