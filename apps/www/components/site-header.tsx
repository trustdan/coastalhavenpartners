"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";

type UserRole = "candidate" | "recruiter" | "school_admin" | "admin" | null;

const DISCORD_INVITE_URL = "https://discord.gg/MarkPXNfXd";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

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

  const router = useRouter();
  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state on mount and subscribe to changes
  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setUserRole(profile?.role as UserRole || null);
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUserRole(profile?.role as UserRole || null);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserRole(null);
    router.push("/");
    router.refresh();
  }

  function getPortalInfo() {
    switch (userRole) {
      case "candidate":
        return { label: "Candidate Portal", href: "/candidate" };
      case "recruiter":
        return { label: "Recruiter Portal", href: "/recruiter" };
      case "school_admin":
        return { label: "Career Services Portal", href: "/school" };
      case "admin":
        return { label: "Admin Portal", href: "/admin" };
      default:
        return null;
    }
  }

  const portalInfo = getPortalInfo();

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
            {!isLoading && (
              <>
                {portalInfo ? (
                  <>
                    <Link
                      href={portalInfo.href}
                      className="hidden md:inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                    >
                      {portalInfo.label}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="hidden md:inline-flex text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </>
            )}
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 hover:text-[#5865F2] hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-[#5865F2] dark:hover:bg-neutral-800 transition-colors"
              title="Join our Discord"
            >
              <DiscordIcon className="h-5 w-5" />
              <span className="sr-only">Join our Discord</span>
            </a>
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
            {!isLoading && (
              <>
                {portalInfo ? (
                  <>
                    <motion.li
                      variants={mobileLinkVar}
                      className="pl-6 py-4 md:hidden"
                    >
                      <Link
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                        href={portalInfo.href}
                      >
                        {portalInfo.label}
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={mobileLinkVar}
                      className="border-grey-dark pl-6 py-0.5 border-b md:hidden"
                    >
                      <button
                        onClick={handleLogout}
                        className="hover:text-grey flex w-full items-center text-xl transition-[color,transform] duration-300"
                        style={{ height: "var(--navigation-height)" }}
                      >
                        Log Out
                      </button>
                    </motion.li>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </>
            )}
            <motion.li
              variants={mobileLinkVar}
              className="pl-6 py-4 md:hidden"
            >
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lg text-[#5865F2] hover:underline"
              >
                <DiscordIcon className="h-6 w-6" />
                Join our Discord
              </a>
            </motion.li>
          </motion.ul>
        </motion.nav>
      </AnimatePresence>
    </>
  );
}
