"use client";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LocalSwitcher from "../ui/LocalSwitcher";
import HireMe from "./HireMe";

const Nav = ({ containerStyles, linkStyles }) => {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  const links = [
    {
      path: "/",
      name: t("home.name"),
    },
    {
      path: "/projects",
      name: t("projects.name"),
    },
    {
      path: "/contact",
      name: t("contact.name"),
    },
  ];
  const normalizedPathname = pathname || "/";
  const isActive = (path) => normalizedPathname === path;

  return (
    <nav className={`${containerStyles}`} aria-label="Primary navigation">
      <div className="flex items-center justify-center gap-x-8">
        {links.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.name}
              href={link.path}
              aria-current={active ? "page" : undefined}
              className={`focus-ring nav-link relative py-2 ${linkStyles} ${active ? "active-link font-bold" : "text-black/65 hover:text-black"}`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
      <HireMe />
      <LocalSwitcher />
    </nav>
  );
};

export default Nav;
