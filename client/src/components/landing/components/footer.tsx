import React from 'react'
import { Separator } from '#/components/ui/separator'
import { ScanLine, Twitter, Github, Linkedin } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="footer bg-card/30 border-t border-border/50 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-foreground">
              <ScanLine className="size-6 text-primary" />
              <span>LYICard</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              AI-powered business card scanner that automatically extracts and
              manages your professional contacts.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Github className="size-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-primary transition-colors"
                >
                  How it works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest font-medium">
          <p>© {new Date().getFullYear()} LYICard Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <p>Made with ❤️ for networkers</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
