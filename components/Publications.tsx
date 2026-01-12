"use client"
import { publications } from "@/lib/data"
import { motion } from "framer-motion"
import { Card } from "./Card"

export function Publications() {
  return (
    <section id="publications" className="py-12 bg-muted/20">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl font-bold tracking-tight mb-6 text-center"
        >
          Publications
        </motion.h2>
        
        <div className="space-y-4">
          {publications.map((pub, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="flex flex-col p-4">
                <h3 className="font-semibold text-sm tracking-tight text-foreground mb-2">
                  {pub.link ? (
                    <a href={pub.link} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground/80 transition-colors">
                      {pub.title}
                    </a>
                  ) : (
                    pub.title
                  )}
                </h3>
                <p className="text-xs text-muted-foreground italic mb-2">
                  {pub.conference}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {pub.authors}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
