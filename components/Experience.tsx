"use client"
import { experience, education } from "@/lib/data"
import { motion } from "framer-motion"
import { Card } from "./Card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Experience() {
  return (
    <section id="experience" className="py-12">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto grid gap-12 md:grid-cols-2">
        
        {/* Experience Section */}
        <div className="space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-bold tracking-tight border-b border-border pb-2"
          >
            Experience
          </motion.h2>
          
          <div className="space-y-4">
            {experience.map((exp: any, index: number) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-4 border-none bg-transparent hover:bg-card/50 transition-colors ${exp.slug ? 'cursor-pointer group' : ''}`}>
                   {exp.slug && (
                    <Link href={`/experience/${exp.slug}`} className="absolute inset-0 z-10">
                      <span className="sr-only">View {exp.company} Experience</span>
                    </Link>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-sm text-foreground">{exp.role}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{exp.period}</span>
                    </div>
                    <div className="text-xs text-foreground/80 font-medium">
                        {exp.company}, {exp.location}
                    </div>
                    {exp.advisor && (
                      <div className="text-xs text-muted-foreground relative z-20">
                        Advisor: <a href={exp.advisorLink} className="hover:underline hover:text-foreground transition-colors">{exp.advisor}</a>
                      </div>
                    )}
                    {exp.description && !exp.slug && (
                       <p className="text-xs text-muted-foreground mt-1 text-justify leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                    {exp.slug && (
                      <div className="mt-2 flex items-center text-[10px] font-medium text-foreground opacity-40 group-hover:opacity-100 transition-opacity">
                        Read More <ArrowRight className="ml-1 h-2.5 w-2.5" />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-bold tracking-tight border-b border-border pb-2"
          >
            Education
          </motion.h2>

           <div className="space-y-4">
            {education.map((edu, index) => (
               <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 border-none bg-transparent hover:bg-card/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                       <h3 className="font-semibold text-sm text-foreground">{edu.school}</h3>
                       <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{edu.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{edu.degree}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
