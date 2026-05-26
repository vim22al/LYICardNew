import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '#/components/ui/navigation-menu'
import { Button } from '#/components/ui/button'
import { ScanLine, Menu } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2 font-bold text-xl text-foreground">
          <ScanLine className="size-6 text-primary" />
          <span>LYICard</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-6 text-sm font-medium text-muted-foreground">
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#how-it-works"
                  className="hover:text-primary transition-colors"
                >
                  How it works
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  Features
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#use-cases"
                  className="hover:text-primary transition-colors"
                >
                  Use Cases
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Link to="/auth/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md hover:shadow-lg transition-all duration-300"
              asChild
            >
              <Link to="/auth/signup">Start Free</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="size-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
