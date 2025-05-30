"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading || !formData.email}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "..." : "Subscribe"}
          </button>
        </form>
        {message && (
          <p className={`mt-2 text-sm ${status === "success" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <motion.div 
        className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-6">
          <Mail className="h-12 w-12 mx-auto mb-4 text-blue-100" />
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-blue-100">
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
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent"
              disabled={isLoading}
            />
            <input
              type="email"
              placeholder="Your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !formData.email}
            className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
          </button>
        </form>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              status === "success" 
                ? "bg-green-500/20 text-green-100" 
                : "bg-red-500/20 text-red-100"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm">{message}</span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-6">
        <Mail className="h-10 w-10 mx-auto mb-3 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Join Our Newsletter
        </h3>
        <p className="text-gray-600">
          Get training tips, app updates, and marathon insights delivered weekly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        
        <input
          type="email"
          placeholder="Your email address"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
          required
        />
        
        <button
          type="submit"
          disabled={isLoading || !formData.email}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            status === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm">{message}</span>
        </motion.div>
      )}
    </motion.div>
  );
} 