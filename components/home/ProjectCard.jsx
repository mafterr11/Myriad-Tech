import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader } from "@/components/ui/card";
import { ArrowUpRight, ArrowRight, Link2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

const ProjectCard = ({ project, cardClassName = "h-[530px]" }) => {
  const t = useTranslations("Proiecte");
  const category = t.has(`category.${project.category}`)
    ? t(`category.${project.category}`)
    : project.category;
  const image = project.image || "/project-bg-light.png";
  const link = project.link || "#";

  return (
    <Card className={`project-card group flex ${cardClassName} w-full flex-col overflow-hidden`}>
      <CardHeader className="p-0">
        <div className="project-card-media bg-work">
          <Image
            className="object-cover object-top"
            src={image}
            fill
            sizes="(max-width: 699px) 90vw, (max-width: 1399px) 46vw, 31vw"
            alt={project.name}
            loading="lazy"
          />
          <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
            <Badge className="rounded-none border border-white/40 bg-accent px-3 py-1 text-[10px] font-bold tracking-[0.1em] text-white uppercase">
              {category}
            </Badge>
            <Link
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("page.demo")}: ${project.name}`}
              className="focus-ring flex h-10 w-10 items-center justify-center border border-white/70 bg-black/70 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 max-md:opacity-100"
            >
              <Link2Icon size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold tracking-[0.12em] text-black/45 uppercase">
          <span>Project</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </div>
        <h3 className="mb-4 font-recursive text-2xl">{project.name}</h3>
        <p className="text-base leading-7 text-black/70">{project.description}</p>
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-bold text-accent underline-offset-4 hover:underline"
        >
          {t("page.demo")}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
};

export default ProjectCard;
