import { Preloader } from "@/components/Preloader";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { ProjectSection } from "@/components/sections/ProjectSection";
import { Process } from "@/components/sections/Process";
import { About } from "@/components/sections/About";
import { Currently } from "@/components/sections/Currently";
import { Contact } from "@/components/sections/Contact";
import { projects } from "@/lib/content";

export default function Home() {
  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to work
      </a>
      <Preloader />
      <Nav />
      <main id="main">
        <Hero />
        <div id="work">
          {projects.map((p, i) => (
            <ProjectSection key={p.id} project={p} index={i} total={projects.length} prevId={projects[i - 1]?.id} />
          ))}
        </div>
        <Process />
        <About />
        <Currently />
        <Contact />
      </main>
    </>
  );
}
