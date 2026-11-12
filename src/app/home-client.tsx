"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  ArrowRight,
  Disc3,
  GraduationCap,
  PhoneCall,
  User,
} from "lucide-react";
import { SiteShell } from "@/components/kryso-site";
import { siteSettings } from "@/data/catalog";
import { useStored } from "@/lib/kryso-storage";

export function HomeClient() {
  const [settings] = useStored("admin-settings", siteSettings);
  const phoneClean = (settings?.phone || "+91 87678 28945").replace(/[^0-9+]/g, "");
  const [isMuted, setIsMuted] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(3); // Highlight Card 3 (Contact Now) by default per Image 2
  const userInteractedMuteRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-play native video immediately on mount & auto-unmute on any user interaction
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = isMuted;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }

    // Auto-unmute on the very first user interaction anywhere on the page
    // (click, tap, touch, keypress) if not explicitly muted by user
    const handleFirstUserInteraction = () => {
      if (userInteractedMuteRef.current) return;
      if (videoRef.current && videoRef.current.muted) {
        videoRef.current.muted = false;
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.then(() => {
            setIsMuted(false);
          }).catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
            }
          });
        } else {
          setIsMuted(false);
        }
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener("pointerdown", handleFirstUserInteraction);
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchstart", handleFirstUserInteraction);
      window.removeEventListener("keydown", handleFirstUserInteraction);
    };

    if (isMuted && !userInteractedMuteRef.current) {
      window.addEventListener("pointerdown", handleFirstUserInteraction, { once: true });
      window.addEventListener("click", handleFirstUserInteraction, { once: true });
      window.addEventListener("touchstart", handleFirstUserInteraction, { once: true });
      window.addEventListener("keydown", handleFirstUserInteraction, { once: true });
    }

    return () => {
      cleanupListeners();
    };
  }, [isMuted]);

  const toggleSound = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (nextMuted) {
        userInteractedMuteRef.current = true;
      } else {
        userInteractedMuteRef.current = false;
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }
    }
  };

  // 4 Navigation Cards matching Image 2
  const cards = [
    {
      id: 0,
      title: "About KRYSO",
      tag: "Know more About KRYSO",
      href: "/about",
      icon: User,
    },
    {
      id: 1,
      title: "KRYSO Music",
      tag: "Stream & Download",
      href: "/music",
      icon: Disc3,
    },
    {
      id: 2,
      title: "KRYSO Academy",
      tag: "Music Academy",
      href: "/academy",
      icon: GraduationCap,
    },
    {
      id: 3,
      title: "Contact Now",
      tag: "For Global Booking & Details",
      href: `tel:${phoneClean}`,
      icon: PhoneCall,
      isTel: true,
    },
  ];

  return (
    <SiteShell>
      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO BANNER VIDEO SECTION (Fullscreen, No Navbar, Image 1 Button)*/}
      {/* ------------------------------------------------------------------ */}
      <section className="relative w-full h-[100svh] min-h-[500px] bg-black overflow-hidden flex flex-col justify-between select-none">
        
        {/* BACKGROUND BANNER VIDEO (FINAL LOOP.mp4) */}
        <div className="absolute inset-0 size-full overflow-hidden pointer-events-none z-0">
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el) el.defaultMuted = true;
            }}
            className="size-full object-cover scale-[1.01]"
            autoPlay
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            muted={isMuted}
            loop
            preload="auto"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            onLoadedMetadata={(e) => {
              e.currentTarget.muted = isMuted;
              e.currentTarget.play().catch(() => {
                e.currentTarget.muted = true;
                setIsMuted(true);
                e.currentTarget.play().catch(() => {});
              });
            }}
          >
            <source src="/videos/hero-banner.webm" type="video/webm" />
            <source src="/videos/hero-banner.mp4" type="video/mp4" />
          </video>
        </div>

        {/* CINEMATIC GRADIENT VIGNETTES */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none z-10" />

        {/* TOP BRAND HEADER (Clean Centered KRYSO Title) */}
        <header className="relative z-20 pt-10 sm:pt-12 px-6 flex flex-col items-center justify-center text-center">
          <Link href="/" className="group inline-flex flex-col items-center">
            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.25em] text-white uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.35)] group-hover:scale-[1.02] transition-transform duration-300">
              KRYSO
            </h1>
          </Link>
        </header>

        {/* BOTTOM CONTROLS: TEXT-ONLY SOUND TOGGLE (Image 4 Style: No button border, text only) */}
        <div className="relative z-20 px-6 sm:px-10 pb-6 sm:pb-8 flex items-center justify-end">
          <button
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            className="flex items-center gap-2.5 bg-transparent p-0 text-white hover:text-amber-400 transition-colors cursor-pointer group select-none"
          >
            {isMuted ? (
              <>
                <VolumeX size={18} className="text-white group-hover:text-amber-400 transition-colors shrink-0" />
                <span className="font-mono text-[10px] sm:text-sm font-bold tracking-widest uppercase">
                  CONTINUE WITHOUT SOUND
                </span>
                <ArrowRight size={16} className="text-white group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </>
            ) : (
              <>
                <Volume2 size={18} className="text-emerald-400 transition-colors shrink-0" />
                <span className="font-mono text-[10px] sm:text-sm font-bold tracking-widest uppercase text-emerald-400">
                  CONTINUE WITH SOUND
                </span>
                <ArrowRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. NAVIGATION CARDS BANNER (OVERLAYING music-hero.jpg, LEFT-ALIGNED)*/}
      {/* ------------------------------------------------------------------ */}
      <section
        id="navigation-section"
        className="relative isolate overflow-hidden bg-background text-white border-t border-white/10 min-h-[360px] sm:min-h-[440px] flex items-center py-10 sm:py-16"
      >
        {/* Moody Amber Geometric Horizon Background Artwork */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/moody-amber-horizon.png"
            alt="KRYSO Sound Banner"
            style={{
              objectPosition: "85% center",
              filter: "brightness(105%) contrast(115%)",
            }}
            className="size-full object-cover sm:[object-position:75%_50%] opacity-90 sm:opacity-85 transition-all duration-300"
            onError={(e) => {
              e.currentTarget.src = "/music-hero.jpg";
            }}
          />
        </div>

        {/* Subtle Vignettes: allows amber horizon artwork to show through clearly on mobile & desktop */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-black/75 sm:hidden pointer-events-none" />
        <div className="absolute inset-0 -z-10 hidden sm:block bg-linear-to-r from-background via-background/85 to-background/20 pointer-events-none" />

        {/* Inner Page Shell: Aligned to the LEFT */}
        <div className="page-shell flex items-center justify-center sm:justify-start">
          
          {/* 4 CARDS (2x2 Grid) - COMPACT RESPONSIVE SIZING, NO TRUNCATION */}
          <div className="w-full max-w-full sm:max-w-2xl">
            <div className="grid grid-cols-2 gap-2 sm:gap-3.5 w-full min-w-0">
              {cards.map((c) => {
                const isHighlighted = hoveredCard === c.id;
                const cardClass = `group relative rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 flex flex-col justify-between border cursor-pointer min-w-0 overflow-hidden min-h-[96px] sm:min-h-[110px] ${
                  isHighlighted
                    ? "bg-amber-500 text-black border-amber-300 shadow-xl shadow-amber-500/25 sm:scale-[1.01] z-10"
                    : "bg-[#060D1E]/70 hover:bg-[#0E1A36] text-white border-white/15 hover:border-amber-400/40 backdrop-blur-md shadow-lg shadow-black/40"
                }`;

                const cardContent = (
                  <>
                    {/* Top Section: Title & Arrow Badge */}
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
                      <div className="min-w-0 flex-1">
                        <h2
                          className={`font-display text-xs sm:text-base md:text-lg font-black tracking-tight leading-snug ${
                            isHighlighted ? "text-black" : "text-white group-hover:text-amber-400"
                          }`}
                        >
                          {c.title}
                        </h2>
                      </div>

                      <div
                        className={`size-5 sm:size-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isHighlighted
                            ? "bg-black text-amber-400 scale-105"
                            : "bg-white/10 text-white/70 group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110"
                        }`}
                      >
                        <ArrowRight size={11} className="sm:hidden" />
                        <ArrowRight size={13} className="hidden sm:block" />
                      </div>
                    </div>

                    {/* Bottom Section: Sleek Frosted Tag Pill */}
                    <div className="mt-2.5 sm:mt-3 flex items-center min-w-0">
                      <span
                        className={`inline-flex items-center rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs md:text-[13px] font-semibold tracking-wide transition-all truncate max-w-full ${
                          isHighlighted
                            ? "bg-black/15 text-black border border-black/15 font-bold"
                            : "bg-white/[0.08] text-white/90 border border-white/10 group-hover:bg-white/[0.14] group-hover:border-amber-400/30 group-hover:text-white"
                        }`}
                      >
                        {c.tag}
                      </span>
                    </div>
                  </>
                );

                if (c.isTel) {
                  return (
                    <a
                      key={c.id}
                      href={c.href}
                      onMouseEnter={() => setHoveredCard(c.id)}
                      className={cardClass}
                    >
                      {cardContent}
                    </a>
                  );
                }

                return (
                  <Link
                    key={c.id}
                    href={c.href}
                    onMouseEnter={() => setHoveredCard(c.id)}
                    className={cardClass}
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </SiteShell>
  );
}
