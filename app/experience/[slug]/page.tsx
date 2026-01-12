import { experience } from "@/lib/data";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { Card } from "@/components/Card";

export function generateStaticParams() {
  return experience
    .filter((exp) => exp.slug)
    .map((exp) => ({
      slug: exp.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const exp = experience.find((e) => (e as any).slug === params.slug);
  if (!exp) return {};

  return {
    title: `${exp.role} at ${exp.company} | Ajay Vikram P`,
    description: exp.description,
  };
}

export default function ExperiencePage({ params }: { params: { slug: string } }) {
  const exp = experience.find((e: any) => e.slug === params.slug) as any;

  if (!exp) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <article className="container pt-28 pb-16 px-4 md:px-6 max-w-4xl mx-auto">
        <Link 
          href="/#experience" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Experience
        </Link>
        
        <header className="mb-12">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                {exp.role} at {exp.company}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <span>{exp.location}</span>
                <span>•</span>
                <span>{exp.period}</span>
            </div>
        </header>

        <div className="space-y-10">
          {exp.sections ? (
            exp.sections.map((section: any, index: number) => (
              <Card key={index} className="p-8 border-white/10 bg-white/5">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-6 border-b border-border pb-3">
                  {section.title}
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-justify prose-p:text-muted-foreground/90">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        img: ({node, ...props}) => (
                            <span className="block my-10">
                               {/* eslint-disable-next-line @next/next/no-img-element */}
                               <img 
                                 {...props} 
                                 className="rounded-xl shadow-2xl mx-auto border border-white/10" 
                                 alt={props.alt || ''} 
                                 style={{
                                     maxWidth: '100%', 
                                     height: 'auto',
                                 }} 
                               />
                            </span>
                        ),
                    }}
                  >
                    {section.content}
                  </ReactMarkdown>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 border-white/10 bg-white/5">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {exp.content || ""}
                    </ReactMarkdown>
                </div>
            </Card>
          )}
        </div>
      </article>
    </div>
  );
}