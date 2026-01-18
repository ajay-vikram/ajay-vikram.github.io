"use client"
import { personalInfo } from "@/lib/data"
import { FaGithub, FaLinkedin, FaMedium } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

export function Footer() {
  return (
    <footer className="py-6 border-t border-border/50">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row mx-auto max-w-5xl px-4 md:px-6">
        <p className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} {personalInfo.name}
        </p>
        <div className="flex gap-4 items-center">
            <SocialLink href={personalInfo.github} icon={<FaGithub className="w-3.5 h-3.5" />} label="GitHub" />
            <SocialLink href={personalInfo.linkedin} icon={<FaLinkedin className="w-3.5 h-3.5" />} label="LinkedIn" />
            <SocialLink href={personalInfo.twitter} icon={<FaXTwitter className="w-3.5 h-3.5" />} label="X" />
            <SocialLink href={personalInfo.medium} icon={<FaMedium className="w-3.5 h-3.5" />} label="Medium" />
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label={label}
      >
        {icon}
      </a>
    )
  }
