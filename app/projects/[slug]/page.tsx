import { projects } from "@/lib/data";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="container py-10 px-4 md:px-6 max-w-4xl mx-auto">
      <Link 
        href="/#projects" 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>
      
      <div className="prose prose-slate dark:prose-invert max-w-none prose-img:rounded-xl prose-img:shadow-lg prose-headings:scroll-mt-20">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({node, ...props}) => {
                const isCNN = props.src && props.src.includes('CNN.png');
                return (
                    <span className="block my-8">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img 
                         {...props} 
                         className="rounded-xl shadow-lg mx-auto max-w-full" 
                         alt={props.alt || ''} 
                         style={{
                             maxWidth: '100%', 
                             height: 'auto',
                             backgroundColor: isCNN ? 'white' : 'transparent',
                             padding: isCNN ? '10px' : '0'
                         }} 
                       />
                    </span>
                )
            },
            table: ({node, ...props}) => (
                <div className="overflow-x-auto my-8">
                    <table {...props} className="w-full border-collapse text-sm" />
                </div>
            )
          }}
        >
          {project.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
