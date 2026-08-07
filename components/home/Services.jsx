"use client";

import { useEffect, useRef, useState } from "react";
import { GanttChartSquare, Blocks, Gem } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Dot } from "../Dot";
import { fadeIn } from "@/variants";
import { MotionDiv, MotionH2 } from "@/lib/motion-client";

const MOBILE_QUERY = "(max-width: 767px)";

const Services = () => {
  const t = useTranslations("Services");
  const cardRefs = useRef([]);
  const [activeService, setActiveService] = useState(null);
  const servicesData = [
    {
      icon: <Blocks size={34} strokeWidth={1.2} />,
      title: "Web Development",
      description: t("second.description"),
      speed: 0.2,
    },
    {
      icon: <GanttChartSquare size={34} strokeWidth={1.2} />,
      title: "Web Design",
      description: t("first.description"),
      speed: 0.4,
    },
    {
      icon: <Gem size={34} strokeWidth={1.2} />,
      title: "SEO",
      description: t("third.description"),
      speed: 0.6,
    },
  ];

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    let observer;

    const observeCards = () => {
      observer?.disconnect();
      setActiveService(null);

      if (!mobileQuery.matches) return;

      const visibleCards = new Map();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = Number(entry.target.dataset.serviceIndex);
            visibleCards.set(index, entry);
          });

          const viewportCenter = window.innerHeight / 2;
          const centeredCards = [...visibleCards.entries()]
            .filter(([, entry]) => entry.isIntersecting)
            .sort(([, first], [, second]) => {
              const firstCenter =
                first.boundingClientRect.top +
                first.boundingClientRect.height / 2;
              const secondCenter =
                second.boundingClientRect.top +
                second.boundingClientRect.height / 2;

              return (
                Math.abs(firstCenter - viewportCenter) -
                Math.abs(secondCenter - viewportCenter)
              );
            });

          setActiveService(centeredCards[0]?.[0] ?? null);
        },
        {
          rootMargin: "-42% 0px -42% 0px",
          threshold: 0,
        },
      );

      cardRefs.current.forEach((card) => {
        if (card) observer.observe(card);
      });
    };

    observeCards();
    mobileQuery.addEventListener("change", observeCards);

    return () => {
      observer?.disconnect();
      mobileQuery.removeEventListener("change", observeCards);
    };
  }, []);

  return (
    <section id="services" className="site-section bg-grainy">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-6 xl:mb-16 xl:flex-row xl:items-end">
          <div>
            <span className="section-kicker">What I do</span>
            <MotionH2
              variants={fadeIn("down", 0.4)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="section-title mt-4"
            >
              <Dot />
              {t("title")}
            </MotionH2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {servicesData.map((item, index) => (
            <MotionDiv
              key={item.title}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-service-index={index}
              variants={fadeIn("down", item.speed)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Card
                data-active={activeService === index}
                onClick={() => {
                  if (window.matchMedia(MOBILE_QUERY).matches) {
                    setActiveService(index);
                  }
                }}
                className="service-card h-full w-full p-6 sm:p-8"
              >
                <CardHeader className="flex flex-row items-start justify-between p-0">
                  <div className="service-icon" aria-hidden="true">
                    {item.icon}
                  </div>
                  <span className="font-recursive text-xs font-bold tracking-[0.16em] text-black/40">
                    0{index + 1}
                  </span>
                </CardHeader>
                <CardContent className="flex h-full flex-col p-0 pt-12">
                  <CardTitle className="mb-4 font-recursive text-2xl">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-7 text-black/70">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
