import { Hero } from "@/components/Hero";
import { Experience } from "@/components/Experience";
import { Publications } from "@/components/Publications";
import { Projects } from "@/components/Projects";
import { Tools } from "@/components/Tools";
import { Skills } from "@/components/Skills";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      <Hero />
      <Experience />
      <Publications />
      <Projects />
      <Tools />
      <Skills />
      <Contact />
    </div>
  );
}