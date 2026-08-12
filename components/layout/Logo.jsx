"use client";

import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";

const Logo = ({ source, size, priority = true }) => {
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
      className="focus-ring inline-flex w-fit items-center"
    >
      <div className={`${size} w-auto`}>
        <Image
          src={source}
          width={250}
          height={250}
          className={`${size} w-auto`}
          alt="Myriad Tech"
          sizes="(max-width: 768px) 180px, 220px"
          priority={priority}
        />
      </div>
    </Link>
  );
};

export default Logo;
