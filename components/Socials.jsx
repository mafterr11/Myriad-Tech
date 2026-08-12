// Link
import Link from "next/link";
// Icons
import { RiInstagramLine, RiGithubLine, RiWhatsappLine } from "react-icons/ri";
import { BiPhone } from "react-icons/bi";

const Socials = ({ className = "", linkClassName = "" }) => {
  const linkStyles = `focus-ring transition-all duration-300 hover:scale-95 hover:text-accent ${linkClassName}`;

  return (
    <div
      className={`flex items-center gap-x-5 text-[1.7rem] xs:text-2xl lg:text-3xl xl:text-2xl ${className}`}
    >
      <a
        href="tel:+40720425840"
        aria-label="Telefon"
        className={linkStyles}
      >
        <BiPhone aria-hidden="true" />
      </a>
      <a
        href="https://wa.me/40720425840"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className={linkStyles}
      >
        <RiWhatsappLine aria-hidden="true" />
      </a>
      <Link
        href={"https://www.instagram.com/alexandru.maftei95/"}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className={linkStyles}
      >
        <RiInstagramLine aria-hidden="true" />
      </Link>
      <Link
        href={"https://github.com/mafterr11"}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        className={linkStyles}
      >
        <RiGithubLine aria-hidden="true" />
      </Link>
    </div>
  );
};

export default Socials;
