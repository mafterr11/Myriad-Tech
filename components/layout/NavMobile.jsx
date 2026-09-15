"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BiSolidFoodMenu } from "react-icons/bi";
import { IoCloseOutline, IoHome, IoChatbubblesSharp } from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import Link from "@/components/layout/TransitionLink";
import { usePathname } from "@/i18n/navigation";
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
  const menuButtonRef = useRef(null);
  const panelRef = useRef(null);
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
    // The portal must wait until the browser DOM exists; rendering it during
    // SSR would produce different server and client trees.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const panel = panelRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
      panel ? [...panel.querySelectorAll(focusableSelector)] : [];

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    const focusFrame = requestAnimationFrame(() => getFocusable()[0]?.focus());

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [isMenuOpen]);

  const isActive = (path) => (pathname || "/") === path;
  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

  return (
    <div className="xl:hidden">
      <button
        ref={menuButtonRef}
        type="button"
        aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="focus-ring flex h-11 w-11 animate-none items-center justify-center border-0 bg-transparent text-2xl text-black transition-none"
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
                    aria-label={t("closeMenu")}
                    onClick={closeMenu}
                    className="absolute inset-0 z-0 cursor-default"
                  />
                  <motion.aside
                    ref={panelRef}
                    id="mobile-navigation"
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("mobileMenu")}
                    initial={{ x: "10%", opacity: 0.92 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "10%", opacity: 0.92 }}
                    transition={panelTransition}
                    className="mobile-nav-panel full-mobile-height border-accent bg-body relative z-10 flex flex-col items-center justify-between border-l px-4 py-6 text-black shadow-2xl sm:px-6 sm:py-8"
                  >
                    <button
                      type="button"
                      onClick={closeMenu}
                      aria-label={t("closeMenu")}
                      className="focus-ring absolute top-4 right-3 flex h-11 w-11 animate-none items-center justify-center border-0 bg-transparent text-2xl transition-none sm:top-5 sm:right-5"
                    >
                      <IoCloseOutline aria-hidden="true" />
                    </button>

                    <div onClick={closeMenu} className="mt-6 flex w-full flex-col items-center gap-3">
                      <Logo source="/icon.svg" size="h-[3.5rem]" />
                      <span className="font-roboto text-center text-xl leading-none">
                        <span className="text-accent">Myriad</span> Tech
                      </span>
                    </div>

                    <nav
                      className="flex flex-col gap-y-3"
                      aria-label={t("mobileMenu")}
                    >
                      {links.map((link) => {
                        const active = isActive(link.path);
                        return (
                          <Link
                            key={link.name}
                            href={link.path}
                            aria-current={active ? "page" : undefined}
                            className={`focus-ring border-line flex items-center gap-x-3 border-b px-2 py-3 text-base sm:gap-x-4 sm:px-3 sm:text-lg ${active ? "text-accent font-bold" : "text-black/75"}`}
                            onClick={closeMenu}
                          >
                            <div
                              className="text-accent text-xl sm:text-2xl"
                              aria-hidden="true"
                            >
                              {link.icon}
                            </div>
                            <div className="tracking-[0.1em] uppercase">
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
