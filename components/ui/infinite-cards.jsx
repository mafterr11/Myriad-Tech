"use client";

import { Star } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const hasCloned = useRef(false);
  const [start, setStart] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || hasCloned.current) return;
    if (!containerRef.current || !scrollerRef.current) return;

    const scrollerContent = Array.from(scrollerRef.current.children);
    scrollerContent.forEach((item) => {
      scrollerRef.current?.appendChild(item.cloneNode(true));
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
    <div
      ref={containerRef}
      className={`relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)] ${className || ""}`}
    >
      <ul
        ref={scrollerRef}
        aria-label="Client testimonials"
        className={`flex w-max min-w-full shrink-0 flex-nowrap gap-5 py-6 ${start ? "animate-scroll" : ""} ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""} motion-reduce:animate-none`}
      >
        {items.map((item) => (
          <li
            className="testimonial-card group relative flex w-[min(86vw,25rem)] max-w-full shrink-0 flex-col justify-between px-6 py-7 sm:w-[28rem] sm:px-8"
            key={item.name}
          >
            <blockquote className="relative text-base leading-7 text-black/75">
              <span className="mb-4 block font-recursive text-4xl leading-none text-accent/60" aria-hidden="true">“</span>
              {item.quote}
            </blockquote>
            <footer className="relative mt-8 border-t border-line pt-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <cite className="block not-italic font-recursive text-lg font-bold text-black">{item.name}</cite>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={item.title}
                    className="focus-ring mt-1 block max-w-[14rem] truncate text-xs text-black/55 hover:text-accent"
                  >
                    {item.title}
                  </Link>
                </div>
                <span className="flex shrink-0 items-center text-[#c89d2d]" aria-label="5 star rating">
                  <Star size={16} strokeWidth={1.2} fill="currentColor" aria-hidden="true" />
                  <Star size={16} strokeWidth={1.2} fill="currentColor" aria-hidden="true" />
                  <Star size={16} strokeWidth={1.2} fill="currentColor" aria-hidden="true" />
                  <Star size={16} strokeWidth={1.2} fill="currentColor" aria-hidden="true" />
                  {item.star}
                </span>
              </div>
            </footer>
          </li>
        ))}
      </ul>
    </div>
  );
};
