"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BiSolidFoodMenu } from "react-icons/bi";
import { IoCloseOutline, IoHome, IoChatbubblesSharp } from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Socials from "../Socials";
import Logo from "./Logo";
import LocalSwitcher from "../ui/LocalSwitcher";
import { HireMeButton, HireMeDialog } from "./HireMe";

const NavMobile = () => {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHireMeOpen, setIsHireMeOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const openHireMe = () => {
    setIsHireMeOpen(true);
    closeMenu();
  };
  const links = [
    {
      path: "/",
      name: t("home.name"),
      icon: <IoHome />,
    },
    {
      path: "/projects",
      name: t("projects.name"),
      icon: <BiSolidFoodMenu />,
    },
    {
      path: "/contact",
      name: t("contact.name"),
      icon: <IoChatbubblesSharp />,
    },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const setVh = () => {
      const vh = window.visualViewport
        ? window.visualViewport.height * 0.01
        : window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setVh);
      window.visualViewport.addEventListener("scroll", setVh);
    } else {
      window.addEventListener("resize", setVh);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setVh);
        window.visualViewport.removeEventListener("scroll", setVh);
      } else {
        window.removeEventListener("resize", setVh);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const isActive = (path) => (pathname || "/") === path;
  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={
          isMenuOpen ? "Close navigation menu" : "Open navigation menu"
        }
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="focus-ring flex h-11 w-11 items-center justify-center border-0 bg-transparent animate-none text-2xl text-black transition-none"
      >
        {isMenuOpen ? (
          <IoCloseOutline aria-hidden="true" />
        ) : (
          <RiMenu2Line aria-hidden="true" />
        )}
      </button>

      <HireMeDialog open={isHireMeOpen} onOpenChange={setIsHireMeOpen} />

      {isMounted
        ? createPortal(
            <AnimatePresence>
              {isMenuOpen ? (
                <motion.div
                  key="mobile-navigation-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                  className="fixed inset-0 z-[60] flex justify-end bg-black/20 xl:hidden"
                >
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={closeMenu}
                    className="absolute inset-0 z-0 cursor-default"
                  />
                  <motion.aside
                    id="mobile-navigation"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                    initial={{ x: "10%", opacity: 0.92 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "10%", opacity: 0.92 }}
                    transition={panelTransition}
                    className="mobile-nav-panel full-mobile-height relative z-10 flex flex-col items-center justify-between border-l border-accent bg-body px-4 py-6 text-black shadow-2xl sm:px-6 sm:py-8"
                  >
                    <button
                      type="button"
                      onClick={closeMenu}
                      aria-label="Close navigation menu"
                      className="focus-ring absolute top-4 right-3 flex h-11 w-11 items-center justify-center border-0 bg-transparent animate-none text-2xl transition-none sm:top-5 sm:right-5"
                    >
                      <IoCloseOutline aria-hidden="true" />
                    </button>

                    <div onClick={closeMenu} className="mt-2">
                      <Logo
                        source="/Myriad Tech header logo telefon.png"
                        size="h-[3.5rem]"
                      />
                    </div>

                    <nav
                      className="flex flex-col gap-y-3"
                      aria-label="Mobile navigation links"
                    >
                      {links.map((link) => {
                        const active = isActive(link.path);
                        return (
                          <Link
                            key={link.name}
                            href={link.path}
                            aria-current={active ? "page" : undefined}
                            className={`focus-ring flex items-center gap-x-3 border-b border-line px-2 py-3 text-base sm:gap-x-4 sm:px-3 sm:text-lg ${active ? "font-bold text-accent" : "text-black/75"}`}
                            onClick={closeMenu}
                          >
                            <div
                              className="text-xl text-accent sm:text-2xl"
                              aria-hidden="true"
                            >
                              {link.icon}
                            </div>
                            <div className="uppercase tracking-[0.1em]">
                              {link.name}
                            </div>
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="flex flex-col items-center justify-center gap-y-4 sm:gap-y-5">
                      <HireMeButton onClick={openHireMe} />
                      <LocalSwitcher />
                      <Socials />
                    </div>
                  </motion.aside>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
};

export default NavMobile;
