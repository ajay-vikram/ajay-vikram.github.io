"use client"
import { projects } from "@/lib/data"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Card } from "./Card"

export function Projects() {
  return (
    <section id="projects" className="py-12 bg-muted/20">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl font-bold tracking-tight mb-6 text-center"
        >
          Selected Projects
        </motion.h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="flex flex-col h-full">
                <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View {project.title}</span>
                </Link>
                
                <div className="aspect-[3/2] relative overflow-hidden bg-muted">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="flex flex-col flex-1 p-3">
                  <h3 className="font-semibold text-sm tracking-tight text-foreground line-clamp-1 mb-0.5">
                    {project.title}
                  </h3>
                   {project.subtitle && (
                     <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-wide">{project.subtitle}</p>
                   )}
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3 text-left leading-relaxed">
                    {project.description}
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-foreground opacity-70 transition-opacity">
                    Read More <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
