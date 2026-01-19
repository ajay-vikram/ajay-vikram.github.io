"use client"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Card } from "./Card"

export function Tools() {
  return (
    <section id="tools" className="py-12 bg-muted/20">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl font-bold tracking-tight mb-6 text-center"
        >
          Tools
        </motion.h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="flex flex-col h-full group">
                <Link href="/tools/positional-encoding" className="absolute inset-0 z-10">
                  <span className="sr-only">View Positional Encoding Visualization</span>
                </Link>
                
                {/* Tool Thumbnail */}
                <div className="aspect-[3/2] relative overflow-hidden bg-muted border-b border-border">
                  <Image
                    src="/assets/img/PE.png"
                    alt="Positional Encoding Visualization"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="flex flex-col flex-1 p-3">
                  <h3 className="font-semibold text-sm tracking-tight text-foreground line-clamp-1 mb-0.5">
                    Positional Encoding
                  </h3>
                   <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-wide">Visualization</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3 text-left leading-relaxed">
                    Interactive visualization of sinusoidal positional encodings used in Transformer models. Explore how d_model and sequence length affect the waves.
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-foreground opacity-70 transition-opacity">
                    Try Tool <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Card>
            </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="h-full"
            >
              <Card className="flex flex-col h-full group">
                <Link href="/tools/optimizer-simulator" className="absolute inset-0 z-10">
                  <span className="sr-only">View Optimizer Simulator</span>
                </Link>
                
                {/* Tool Thumbnail */}
                <div className="aspect-[3/2] relative overflow-hidden bg-muted border-b border-border">
                  <Image
                    src="/assets/img/optimizer.jpg"
                    alt="Optimizer Simulator"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="flex flex-col flex-1 p-3">
                  <h3 className="font-semibold text-sm tracking-tight text-foreground line-clamp-1 mb-0.5">
                    Optimizer Simulator
                  </h3>
                   <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-wide">Simulation</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3 text-left leading-relaxed">
                    Compare how SGD, Momentum, RMSProp, and Adam navigate loss landscapes. Visualize convergence, oscillations, and saddle points in real-time.
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-foreground opacity-70 transition-opacity">
                    Try Tool <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Card>
            </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="h-full"
            >
              <Card className="flex flex-col h-full group">
                <Link href="/tools/cnn-visualizer" className="absolute inset-0 z-10">
                  <span className="sr-only">View CNN Visualizer</span>
                </Link>
                
                {/* Visual Placeholder */}
                <div className="aspect-[3/2] relative overflow-hidden bg-muted border-b border-border">
                  <Image
                    src="/assets/img/conv.png"
                    alt="CNN Visualizer"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="flex flex-col flex-1 p-3">
                  <h3 className="font-semibold text-sm tracking-tight text-foreground line-clamp-1 mb-0.5">
                    CNN Visualizer
                  </h3>
                   <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-wide">Interactive Demo</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3 text-left leading-relaxed">
                    Interactive convolution demonstration. Adjust stride, padding, and dilation to see how they transform the input feature map in real-time.
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-foreground opacity-70 transition-opacity">
                    Try Tool <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Card>
            </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="h-full"
            >
              <Card className="flex flex-col h-full group">
                <Link href="/tools/quantization-visualizer" className="absolute inset-0 z-10">
                  <span className="sr-only">View Quantization Visualizer</span>
                </Link>
                
                {/* Visual Placeholder */}
                <div className="aspect-[3/2] relative overflow-hidden bg-muted border-b border-border">
                  <Image
                    src="/assets/img/QAT.png"
                    alt="Quantization Visualizer"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="flex flex-col flex-1 p-3">
                  <h3 className="font-semibold text-sm tracking-tight text-foreground line-clamp-1 mb-0.5">
                    Quantization Visualizer
                  </h3>
                   <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-wide">Interactive Demo</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3 text-left leading-relaxed">
                    Interactive visualization of FP32 to Int4 quantization. Explore symmetric vs asymmetric schemes and how dynamic ranges affect precision.
                  </p>
                  <div className="mt-auto flex items-center text-xs font-medium text-foreground opacity-70 transition-opacity">
                    Try Tool <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </Card>
            </motion.div>
        </div>
      </div>
    </section>
  )
}
