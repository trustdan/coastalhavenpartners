"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";

const menuItem = [
  {
    id: 1,
    label: "For Students",
    href: "#students",
  },
  {
    id: 2,
    label: "For Recruiters",
    href: "#recruiters",
  },
  {
    id: 3,
    label: "For Schools",
    href: "#schools",
  },
];

export function SiteHeader() {
  const mobilenavbarVariant = {
    initial: {
      opacity: 0,
      scale: 1,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        delay: 0.2,
        ease: "easeOut",
      },
    },
  };

  const mobileLinkVar = {
    initial: {
      y: "-20px",
      opacity: 0,
    },
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);

  useEffect(() => {
    const html = document.querySelector("html");
    if (html) html.classList.toggle("overflow-hidden", hamburgerMenuIsOpen);
  }, [hamburgerMenuIsOpen]);

  useEffect(() => {
    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false);
    window.addEventListener("orientationchange", closeHamburgerNavigation);
    window.addEventListener("resize", closeHamburgerNavigation);

    return () => {
      window.removeEventListener("orientationchange", closeHamburgerNavigation);
      window.removeEventListener("resize", closeHamburgerNavigation);
    };
  }, [setHamburgerMenuIsOpen]);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full px-4 animate-fade-in border-b opacity-0 backdrop-blur-md [--animation-delay:600ms]">
        <div
          className="container mx-auto flex w-full items-center justify-between"
          style={{ height: "var(--navigation-height)" }}
        >
          <Link
            className="text-md flex items-center justify-center gap-2 font-semibold"
            href="/"
          >
            <Image
              src="/logo.svg"
              alt="Coastal Haven Partners logo"
              width={40}
              height={30}
              className="shadow-lg shadow-primary/20"
            />
            <span>Coastal Haven Partners</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex ml-auto items-center gap-6">
            {menuItem.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto md:ml-6 flex h-full items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hidden md:inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
            <AnimatedThemeToggler />
          </div>
          <button
            className="ml-6 md:hidden"
            onClick={() => setHamburgerMenuIsOpen((open) => !open)}
          >
            <span className="sr-only">Toggle menu</span>
            {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
          </button>
        </div>
      </header>
      <AnimatePresence>
        <motion.nav
          initial="initial"
          exit="exit"
          variants={mobilenavbarVariant}
          animate={hamburgerMenuIsOpen ? "animate" : "exit"}
          className={cn(
            `fixed left-0 top-0 z-50 h-screen w-full overflow-auto bg-background/70 backdrop-blur-md `,
            {
              "pointer-events-none": !hamburgerMenuIsOpen,
            }
          )}
        >
          <div
            className="container mx-auto flex items-center justify-between"
            style={{ height: "var(--navigation-height)" }}
          >
            <Link
              className="text-md flex items-center gap-2 font-semibold"
              href="/"
            >
              <Image
                src="/logo.svg"
                alt="Coastal Haven Partners logo"
                width={40}
                height={30}
                className="shadow-lg shadow-primary/20"
              />
              <span>Coastal Haven Partners</span>
            </Link>

            <button
              className="ml-6 md:hidden"
              onClick={() => setHamburgerMenuIsOpen((open) => !open)}
            >
              <span className="sr-only">Toggle menu</span>
              {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
            </button>
          </div>
          <motion.ul
            className={`flex flex-col md:flex-row md:items-center uppercase md:normal-case ease-in`}
            variants={containerVariants}
            initial="initial"
            animate={hamburgerMenuIsOpen ? "open" : "exit"}
          >
            {menuItem.map((item) => (
              <motion.li
                variants={mobileLinkVar}
                key={item.id}
                className="border-grey-dark pl-6 py-0.5 border-b md:border-none"
              >
                <Link
                  className={`hover:text-grey flex w-full items-center text-xl transition-[color,transform] duration-300 md:translate-y-0 md:text-sm md:transition-colors ${
                    hamburgerMenuIsOpen ? "[&_a]:translate-y-0" : ""
                  }`}
                  style={{ height: "var(--navigation-height)" }}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
            {/* Mobile Auth Buttons */}
            <motion.li
              variants={mobileLinkVar}
              className="border-grey-dark pl-6 py-0.5 border-b md:hidden"
            >
              <Link
                className="hover:text-grey flex w-full items-center text-xl transition-[color,transform] duration-300"
                style={{ height: "var(--navigation-height)" }}
                href="/login"
              >
                Sign In
              </Link>
            </motion.li>
            <motion.li
              variants={mobileLinkVar}
              className="pl-6 py-4 md:hidden"
            >
              <Link
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                href="/signup"
              >
                Get Started
              </Link>
            </motion.li>
          </motion.ul>
        </motion.nav>
      </AnimatePresence>
    </>
  );
}
