"use client"
import { skills } from "@/lib/data"
import { motion } from "framer-motion"

export function Skills() {
  return (
    <section id="skills" className="py-12">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl font-bold tracking-tight mb-8 text-center"
        >
          Technical Skills
        </motion.h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {skills.map((skill, index) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-center px-2 py-1.5 rounded-md border border-white/5 bg-white/5 hover:bg-white/10 hover:border-amber-500/50 transition-all cursor-default h-full w-full backdrop-blur-sm group"
            >
              <span className="text-[10px] font-medium text-neutral-400 group-hover:text-amber-100 transition-colors">
                {skill}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}