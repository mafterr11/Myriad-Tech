import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader } from "@/components/ui/card";
import { ArrowUpRight, ArrowRight, Link2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

const ProjectCard = ({
  project,
  cardClassName = "h-[530px]",
  descriptionClassName = "line-clamp-4",
  readMoreThreshold = 140,
}) => {
  const t = useTranslations("Proiecte");
  const category = t.has(`category.${project.category}`)
    ? t(`category.${project.category}`)
    : project.category;
  const image = project.image || "/project-bg-light.png";
  const link = project.link || "#";
  const description = project.description || "";
  const hasMoreDescription = description.length > readMoreThreshold;

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

      <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold tracking-[0.12em] text-black/45 uppercase">
          <span>Project</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </div>
        <h3 className="mb-4 font-recursive text-2xl">{project.name}</h3>
        <p className={`${descriptionClassName} text-base leading-7 text-black/70`}>
          {description}
        </p>
        {hasMoreDescription && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="focus-ring mt-2 h-auto min-w-0 self-start border-0 p-0 text-xs font-bold tracking-normal text-black/70 underline-offset-4 hover:translate-y-0 hover:bg-transparent hover:text-black hover:underline"
              >
                {t("page.readMore")}
                <ArrowRight size={14} aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none border-line bg-body px-6 py-8 sm:px-10 sm:py-10">
              <DialogHeader className="pr-8">
                <span className="text-xs font-bold tracking-[0.12em] text-black/55 uppercase">
                  {category}
                </span>
                <DialogTitle className="font-recursive text-2xl leading-tight font-normal sm:text-3xl">
                  {project.name}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="!text-black/80 text-base leading-7 sm:text-lg sm:leading-8">
                {description}
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-auto inline-flex w-fit shrink-0 items-center gap-2 pt-5 text-sm font-bold text-accent underline-offset-4 hover:underline"
        >
          {t("page.demo")}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
};

export default ProjectCard;
