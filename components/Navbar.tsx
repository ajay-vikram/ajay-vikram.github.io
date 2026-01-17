"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function Navbar() {
  const navs = [
    { name: "About", href: "/#about" },
    { name: "Experience", href: "/#experience" },
    { name: "Publications", href: "/#publications" },
    { name: "Projects", href: "/#projects" },
    { name: "Tools", href: "/#tools" },
    { name: "Skills", href: "/#skills" },
    { name: "Resume", href: "/Resume.pdf" },
    { name: "Contact", href: "/#contact" },
  ]

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container flex h-14 items-center justify-between mx-auto px-4 sm:px-8 max-w-5xl">
        <Link href="/" className="font-semibold tracking-tight text-lg hover:opacity-80 transition-opacity">
          Ajay Vikram P
        </Link>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6">
            {navs.map((nav) => (
              <Link
                key={nav.href}
                href={nav.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {nav.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}