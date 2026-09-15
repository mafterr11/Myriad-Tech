"use client";

import Image from "next/image";
import Link from "@/components/layout/TransitionLink";
import { usePathname } from "@/i18n/navigation";

const Logo = ({ source, size, priority = true, wordmark = false }) => {
  const pathname = usePathname();

  const handleClick = (event) => {
    if (
      (pathname || "/") !== "/" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Link
      href="/"
      aria-label="Myriad Tech home"
      onClick={handleClick}
      className="focus-ring font-roboto inline-flex w-fit shrink-0 items-center gap-2 text-2xl leading-none whitespace-nowrap sm:gap-3"
    >
      {wordmark && <span className="text-accent">Myriad</span>}
      <div className={`${size} w-auto shrink-0`}>
        <Image
          src={source}
          width={250}
          height={250}
          className={`${size} w-auto`}
          alt={wordmark ? "" : "Myriad Tech"}
          sizes="(max-width: 768px) 180px, 220px"
          priority={priority}
        />
      </div>
      {wordmark && <span className="text-black">Tech</span>}
    </Link>
  );
};

export default Logo;
