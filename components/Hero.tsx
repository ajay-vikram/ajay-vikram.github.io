"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { personalInfo } from "@/lib/data"
import { FaGithub, FaLinkedin, FaMedium, FaFileAlt } from "react-icons/fa"
import { MdEmail } from "react-icons/md"

export function Hero() {
  return (
    <section id="about" className="pt-24 pb-12 md:pt-32 md:pb-16 flex items-center justify-center">
      <div className="container px-4 md:px-6 flex flex-col items-center gap-6 max-w-3xl text-center">
        
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           className="relative w-32 h-32 md:w-36 md:h-36 overflow-hidden rounded-full border-2 border-muted shadow-xl"
        >
          <Image
            src={personalInfo.image}
            alt={personalInfo.name}
            fill
            className="object-cover object-top" // Focus on top of image to ensure hair/face isn't cut
            priority
          />
        </motion.div>

        <div className="space-y-3">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
          >
            {personalInfo.name}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col gap-0.5 items-center"
          >
             <p className="text-base md:text-lg font-medium text-foreground/90">
              {personalInfo.role}
            </p>
             <p className="text-sm text-muted-foreground font-medium">
              {personalInfo.location}
            </p>
          </motion.div>
         
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto text-justify"
          >
            {personalInfo.bio}
          </motion.p>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex gap-5 justify-center"
          >
            <SocialLink href={personalInfo.github} icon={<FaGithub className="w-5 h-5" />} label="GitHub" />
            <SocialLink href={personalInfo.linkedin} icon={<FaLinkedin className="w-5 h-5" />} label="LinkedIn" />
            <SocialLink href={personalInfo.medium} icon={<FaMedium className="w-5 h-5" />} label="Medium" />
            <SocialLink href={`mailto:${personalInfo.email}`} icon={<MdEmail className="w-5 h-5" />} label="Email" />
            <SocialLink href="/Resume.pdf" icon={<FaFileAlt className="w-5 h-5" />} label="Resume" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Actively Seeking ML Internships for Summer 2026!
        </motion.div>
      </div>
    </section>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      aria-label={label}
    >
      {icon}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-card border border-border text-foreground text-[10px] font-medium rounded opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 whitespace-nowrap z-10 shadow-sm">
        {label}
      </span>
    </a>
  )
}
