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
  const trackRef = useRef(null);
  const [activeService, setActiveService] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
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

  // On mobile the three cards live in a horizontal snap carousel, so "active"
  // means the card sitting closest to the centre of the track, not of the
  // viewport. On desktop nothing is auto-activated — hover does the work.
  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    let observer;

    const observeCards = () => {
      observer?.disconnect();
      setIsMobile(mobileQuery.matches);

      if (!mobileQuery.matches || !trackRef.current) {
        setActiveService(null);
        return;
      }

      const track = trackRef.current;
      const visibleCards = new Map();

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const index = Number(entry.target.dataset.serviceIndex);
            visibleCards.set(index, entry);
          });

          const trackRect = track.getBoundingClientRect();
          const trackCenter = trackRect.left + trackRect.width / 2;
          const centeredCards = [...visibleCards.entries()]
            .filter(([, entry]) => entry.isIntersecting)
            .sort(([, first], [, second]) => {
              const firstCenter =
                first.boundingClientRect.left +
                first.boundingClientRect.width / 2;
              const secondCenter =
                second.boundingClientRect.left +
                second.boundingClientRect.width / 2;

              return (
                Math.abs(firstCenter - trackCenter) -
                Math.abs(secondCenter - trackCenter)
              );
            });

          setActiveService(centeredCards[0]?.[0] ?? 0);
        },
        {
          root: track,
          rootMargin: "0px -35% 0px -35%",
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

  const scrollToService = (index) => {
    const track = trackRef.current;
    const card = cardRefs.current[index];

    if (!track || !card) return;

    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
  };

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

        {/* In the carousel the cards sit side by side, so a scroll-triggered
            fade caught them mid-swipe and the next card arrived half
            transparent. On mobile they settle as soon as they mount. */}
        <div ref={trackRef} className="services-track">
          {servicesData.map((item, index) => (
            <MotionDiv
              key={item.title}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-service-index={index}
              variants={fadeIn("down", isMobile ? 0 : item.speed)}
              initial="hidden"
              animate={isMobile ? "show" : undefined}
              whileInView={isMobile ? undefined : "show"}
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

        <div className="services-dots" aria-hidden="true">
          {servicesData.map((item, index) => (
            <button
              key={item.title}
              type="button"
              tabIndex={-1}
              aria-label={item.title}
              onClick={() => scrollToService(index)}
              className="services-dot-button focus-ring"
            >
              <span
                className="services-dot"
                data-active={activeService === index}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
