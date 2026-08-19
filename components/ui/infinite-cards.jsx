"use client";

import { Star, Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import HalfStar from "./half-star";

// The marquee is built by duplicating the list in the DOM. The duplicates are
// decoration: they are hidden from assistive technology and taken out of the
// tab order so every testimonial and every client link is announced once.
const hideClone = (clone) => {
  clone.setAttribute("aria-hidden", "true");
  clone
    .querySelectorAll("a, button, [tabindex]")
    .forEach((node) => node.setAttribute("tabindex", "-1"));
};

const displayHost = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const Rating = ({ rating }) => (
  <span
    className="flex shrink-0 items-center text-[#c89d2d]"
    aria-label={`${rating} / 5`}
  >
    {Array.from({ length: 5 }, (_, index) => {
      const position = index + 1;

      if (rating >= position) {
        return (
          <Star
            key={position}
            size={16}
            strokeWidth={1.2}
            fill="currentColor"
            aria-hidden="true"
          />
        );
      }

      return rating > index ? (
        <HalfStar key={position} />
      ) : (
        <Star key={position} size={16} strokeWidth={1.2} aria-hidden="true" />
      );
    })}
  </span>
);

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const t = useTranslations("Reviews");
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const hasCloned = useRef(false);
  const [start, setStart] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || hasCloned.current) return;
    if (!containerRef.current || !scrollerRef.current) return;

    Array.from(scrollerRef.current.children).forEach((item) => {
      const clone = item.cloneNode(true);
      hideClone(clone);
      scrollerRef.current?.appendChild(clone);
    });

    containerRef.current.style.setProperty(
      "--animation-direction",
      direction === "left" ? "forwards" : "reverse",
    );
    containerRef.current.style.setProperty(
      "--animation-duration",
      speed === "fast" ? "20s" : speed === "normal" ? "40s" : "60s",
    );
    hasCloned.current = true;
    setStart(true);
  }, [direction, prefersReducedMotion, speed]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)] ${className || ""}`}
      >
        <ul
          ref={scrollerRef}
          aria-label="Client testimonials"
          style={isPaused ? { animationPlayState: "paused" } : undefined}
          className={`flex w-max min-w-full shrink-0 flex-nowrap gap-5 py-6 ${start ? "animate-scroll" : ""} ${pauseOnHover && !isPaused ? "hover:[animation-play-state:paused]" : ""} motion-reduce:animate-none`}
        >
          {items.map((item) => (
            <li
              className="testimonial-card group relative flex w-[min(86vw,25rem)] max-w-full shrink-0 flex-col justify-between px-6 py-7 sm:w-[28rem] sm:px-8"
              key={item.name}
            >
              <blockquote className="relative text-base leading-7 text-black/75">
                <span
                  className="mb-4 block font-recursive text-4xl leading-none text-accent/60"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                {item.quote}
              </blockquote>
              <footer className="relative mt-8 border-t border-line pt-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <cite className="block font-recursive text-lg font-bold text-black not-italic">
                      {item.name}
                    </cite>
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href={item.url}
                      aria-label={t("visit", { name: item.name })}
                      className="focus-ring mt-1 block max-w-[14rem] truncate text-xs text-black/55 hover:text-accent"
                    >
                      {displayHost(item.url)}
                    </Link>
                  </div>
                  <Rating rating={item.rating} />
                </div>
              </footer>
            </li>
          ))}
        </ul>
      </div>

      {start ? (
        <button
          type="button"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-label={isPaused ? t("play") : t("pause")}
          className="focus-ring mx-auto mt-2 flex h-10 w-10 items-center justify-center border border-line bg-white/60 text-accent transition-colors hover:bg-white motion-reduce:transition-none"
        >
          {isPaused ? (
            <Play size={16} aria-hidden="true" />
          ) : (
            <Pause size={16} aria-hidden="true" />
          )}
        </button>
      ) : null}
    </div>
  );
};
