"use client"
import { personalInfo } from "@/lib/data"
import { motion } from "framer-motion"

export function Contact() {
  return (
    <section id="contact" className="py-12 bg-muted/20">
      <div className="container px-4 md:px-6 max-w-lg mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl font-bold tracking-tight mb-6 text-center"
        >
          Get in Touch
        </motion.h2>
        
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          action={`https://formspree.io/f/${personalInfo.formspreeId}`}
          method="POST"
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Name</label>
              <input 
                id="name"
                name="name" 
                required 
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <input 
                id="email"
                type="email" 
                name="email" 
                required 
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="subject" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
            <input 
                id="subject"
                type="text" 
                name="subject" 
                required 
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="message" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Message</label>
            <textarea 
              id="message"
              name="message" 
              rows={4} 
              required 
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            ></textarea>
          </div>

          <button 
            type="submit"
            className="inline-flex h-8 items-center justify-center rounded-md bg-foreground px-6 text-xs font-medium text-background shadow hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-auto"
          >
            Send Message
          </button>
        </motion.form>
      </div>
    </section>
  )
}
