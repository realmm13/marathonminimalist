"use client";
import Link from "next/link";
import { Twitter, Github, Mail, Heart } from "lucide-react";
import { Logo } from "@/components/core/Logo";
import { motion } from "framer-motion";
import { APP_NAME, APP_DESCRIPTION } from "@/config/config";

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/yourusername/marathon-minimalist",
    icon: Github,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/yourusername",
    icon: Twitter,
  },
  {
    name: "Email",
    href: "mailto:hello@marathonminimalist.com",
    icon: Mail,
  },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="mx-auto mt-auto w-full max-w-[var(--container-max-width)] bg-background">
      <div className="container-enhanced py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h2 className="heading-5 mb-3">{APP_NAME}</h2>
            <p className="body-medium text-muted-foreground mb-4 max-w-md">
              {APP_DESCRIPTION}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    aria-label={link.name}
                  >
                    <Icon size={20} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="heading-6 mb-3 text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="body-small text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 text-center">
          <p className="body-small text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. Made with{" "}
            <Heart className="inline h-4 w-4 text-primary" /> for runners
            everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
