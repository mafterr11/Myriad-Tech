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
  cardClassName = "min-h-[530px]",
  descriptionClassName = "line-clamp-4",
  readMoreThreshold = 140,
  compactMobile = false,
  headingLevel = "h3",
}) => {
  const t = useTranslations("Proiecte");
  const category = t.has(`category.${project.category}`)
    ? t(`category.${project.category}`)
    : project.category;
  const image = project.image || "/project-bg-light.png";
  const link = project.link || "#";
  const description = project.description || "";
  // The eyebrow used to read "Project" on every card. The host of the demo
  // link says something the badge and the title do not — and falls back to
  // the generic label for a project with no live URL.
  const linkHost = (() => {
    try {
      return new URL(link).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();
  const hasMoreDescription =
    Boolean(description.trim()) &&
    (compactMobile || description.length > readMoreThreshold);
  const imageAlt = t("page.imageAlt", { name: project.name, category });
  const HeadingTag = headingLevel === "h2" ? "h2" : "h3";

  return (
    <Card
      className={`project-card group relative flex ${cardClassName} w-full overflow-hidden ${compactMobile ? "flex-col max-md:!min-h-[390px] md:!min-h-[530px]" : "flex-col"}`}
    >
      {/* The whole card is clickable, but only the "demo" link at the bottom
          is focusable. The overlay and the corner icon repeat that exact
          destination, so they stay real anchors — middle-click and ctrl-click
          still work — while being kept out of the tab order and the
          accessibility tree rather than giving every card three stops. */}
      <Link
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-10"
      />

      <CardHeader
        className={`relative z-20 shrink-0 p-0 pointer-events-none ${compactMobile ? "max-md:!h-[160px] max-md:w-full" : ""}`}
      >
        <div
          className={`project-card-media bg-work ${compactMobile ? "max-md:!h-full max-md:!w-full max-md:!border-r-0 max-md:!border-b max-md:!border-line" : ""}`}
        >
          <Image
            className="object-cover object-top"
            src={image}
            fill
            sizes={
              compactMobile
                ? "(max-width: 767px) 90vw, (max-width: 1399px) 46vw, 31vw"
                : "(max-width: 699px) 90vw, (max-width: 1399px) 46vw, 31vw"
            }
            alt={imageAlt}
            loading="lazy"
          />
          <div
            className={`absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3 ${compactMobile ? "max-md:inset-x-3 max-md:top-3 max-md:gap-2" : ""}`}
          >
            <Badge
              className={`rounded-none border border-white/40 bg-accent px-3 py-1 text-[10px] font-bold tracking-[0.1em] text-white uppercase ${compactMobile ? "max-md:max-w-[calc(100%-2.5rem)] max-md:truncate max-md:px-2 max-md:py-1 max-md:text-[9px] max-md:tracking-[0.08em]" : ""}`}
            >
              {category}
            </Badge>
            <span
              aria-hidden="true"
              className={`relative z-30 flex h-10 w-10 items-center justify-center border border-white/70 bg-black/70 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 max-md:opacity-100 ${compactMobile ? "max-md:h-8 max-md:w-8" : ""}`}
            >
              <Link2Icon
                size={18}
                className={compactMobile ? "max-md:h-3.5 max-md:w-3.5" : undefined}
              />
            </span>
          </div>
        </div>
      </CardHeader>

      <div
        className={`relative z-20 flex min-h-0 flex-1 flex-col px-5 py-5 pointer-events-none ${compactMobile ? "max-md:min-w-0 max-md:px-4 max-md:py-3" : ""}`}
      >
        <div
          className={`project-card-eyebrow mb-3 flex items-center justify-between gap-3 text-xs font-bold tracking-[0.12em] text-black/45 uppercase ${compactMobile ? "max-md:mb-1 max-md:gap-2 max-md:pb-1.5 max-md:text-[10px] max-md:tracking-[0.1em]" : ""}`}
        >
          <span className="min-w-0 truncate normal-case">{linkHost ?? "Project"}</span>
          <ArrowUpRight
            size={16}
            className={compactMobile ? "max-md:h-3 max-md:w-3" : undefined}
            aria-hidden="true"
          />
        </div>
        <HeadingTag
          className={`project-card-title mt-3 mb-4 line-clamp-2 shrink-0 font-recursive text-2xl ${compactMobile ? "max-md:mt-1.5 max-md:mb-1.5 max-md:text-xl max-md:leading-tight" : ""}`}
        >
          {project.name}
        </HeadingTag>
        <p
          className={`${descriptionClassName} shrink-0 text-base leading-7 text-black/70 ${compactMobile ? "max-md:line-clamp-2 max-md:text-sm max-md:leading-5" : ""}`}
        >
          {description}
        </p>
        <div
          className={
            compactMobile
              ? "contents max-md:mt-auto max-md:flex max-md:flex-wrap max-md:items-center max-md:justify-between max-md:gap-x-2 max-md:border-t max-md:border-line"
              : "contents"
          }
        >
          {hasMoreDescription && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`focus-ring relative z-30 mt-2 mb-2 min-h-11 min-w-0 shrink-0 self-start pointer-events-auto border-0 p-0 text-xs font-bold tracking-normal text-black/70 underline-offset-4 hover:translate-y-0 hover:bg-transparent hover:text-black hover:underline ${compactMobile ? "max-md:mt-0 max-md:mb-0 max-md:gap-1 max-md:text-xs max-md:leading-4" : ""}`}
                >
                  {t("page.readMore")}
                  <ArrowRight size={14} aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-none border-line bg-body px-5 py-7 sm:px-10 sm:py-10">
                <DialogHeader className="pr-8">
                  <span className="text-xs font-bold tracking-[0.12em] text-black/55 uppercase">
                    {category}
                  </span>
                  <DialogTitle className="font-recursive text-2xl leading-tight font-normal sm:text-3xl">
                    {project.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-work sm:aspect-video">
                  <Image
                    className="object-contain object-center"
                    src={image}
                    fill
                    sizes="(max-width: 640px) calc(100vw - 4rem), 44rem"
                    alt={imageAlt}
                    loading="lazy"
                  />
                </div>
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
            aria-label={`${t("page.demo")}: ${project.name}`}
            className={`project-card-foot focus-ring relative z-30 mt-auto flex min-h-11 w-full shrink-0 items-center justify-between gap-2 pt-4 pointer-events-auto text-sm font-bold text-accent underline-offset-4 hover:underline ${compactMobile ? "max-md:mt-0 max-md:w-auto max-md:max-w-full max-md:gap-1.5 max-md:!border-t-0 max-md:pt-0 max-md:text-sm" : ""}`}
          >
            <span className={compactMobile ? "max-md:min-w-0 max-md:truncate" : undefined}>
              {t("page.demo")}
            </span>
            <ArrowRight
              size={18}
              className={compactMobile ? "max-md:h-3.5 max-md:w-3.5" : undefined}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
