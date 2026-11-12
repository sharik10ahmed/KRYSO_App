"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mic2,
  Sparkles,
  ArrowRight,
  Sliders,
  Flame,
  Youtube,
  Instagram,
  Disc3,
  Play,
  Pause,
  Globe,
  Users,
  Download,
  ExternalLink,
  FileVideo,
  Image as ImageIcon,
  FolderDown,
  X,
  Tv,
  Phone,
  Mail,
  CheckCircle2,
  Volume2,
  VolumeX,
  Calendar,
  Ticket,
  MapPin,
  Clock,
  MessageCircle,
  Facebook,
  Check,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/kryso-site";
import { SpotifyIcon } from "@/components/spotify-icon";
import { useStored } from "@/lib/kryso-storage";
import {
  defaultKrysoPageImages,
  defaultKrysoPageConfig,
  defaultKrysoBiography,
  defaultKrysoShowsData,
  defaultKrysoDownloads,
  defaultKrysoDownloadsSectionConfig,
  defaultKrysoProducerData,
  defaultKrysoTechriderData,
  type KrysoPageImage,
  type KrysoPageConfig,
  type KrysoBiography,
  type KrysoShowsData,
  type KrysoDownloadItem,
  type KrysoDownloadsSectionConfig,
  type KrysoProducerData,
  type KrysoTechriderData,
} from "@/data/catalog";
import { formatImageUrl, formatVideoUrl, getVideoSourceInfo } from "@/lib/media-utils";

export function AboutClient() {
  const [images, setImages] = useStored<KrysoPageImage[]>("admin-kryso-images", defaultKrysoPageImages);
  const [config, setConfig] = useStored<KrysoPageConfig>("admin-kryso-config", defaultKrysoPageConfig);
  const [biography, setBiography] = useStored<KrysoBiography>("admin-kryso-biography", defaultKrysoBiography);
  const [shows, setShows] = useStored<KrysoShowsData>("admin-kryso-shows", defaultKrysoShowsData);
  const [downloads, setDownloads] = useStored<KrysoDownloadItem[]>("admin-kryso-downloads", defaultKrysoDownloads);
  const [downloadsSection, setDownloadsSection] = useStored<KrysoDownloadsSectionConfig>(
    "admin-kryso-downloads-section",
    defaultKrysoDownloadsSectionConfig,
  );
  const [producer, setProducer] = useStored<KrysoProducerData>("admin-kryso-producer", defaultKrysoProducerData);
  const [techrider, setTechrider] = useStored<KrysoTechriderData>("admin-kryso-techrider", defaultKrysoTechriderData);
  const [downloadFilter, setDownloadFilter] = useState<"all" | "image" | "video">("all");
  const [activeVideoModal, setActiveVideoModal] = useState<KrysoDownloadItem | null>(null);

  // Take the 3 images (or configured images)
  const displayImages = images && images.length > 0 ? images.slice(0, 3) : defaultKrysoPageImages.slice(0, 3);

    // Sync latest images, config, biography, shows, downloads, producer & techrider from MongoDB
  useEffect(() => {
    fetch("/api/collections?name=kryso_page_images")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setImages(data.items);
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_page_config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteConfig = data.items[0];
          if (remoteConfig) {
            setConfig((prev) => ({ ...prev, ...remoteConfig }));
          }
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_biography")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteBio = data.items[0];
          if (remoteBio) setBiography((prev) => ({ ...prev, ...remoteBio }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_shows")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteShows = data.items[0];
          if (remoteShows) setShows((prev) => ({ ...prev, ...remoteShows }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_downloads")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setDownloads(data.items);
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_producer")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteProducer = data.items[0];
          if (remoteProducer) setProducer((prev) => ({ ...prev, ...remoteProducer }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_techrider")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteTechrider = data.items[0];
          if (remoteTechrider) setTechrider((prev) => ({ ...prev, ...remoteTechrider }));
        }
      })
      .catch(() => {});

    fetch("/api/collections?name=kryso_downloads_section")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          const remoteSection = data.items[0];
          if (remoteSection) setDownloadsSection((prev) => ({ ...prev, ...remoteSection }));
        }
      })
      .catch(() => {});
  }, [setImages, setConfig, setBiography, setShows, setDownloads, setDownloadsSection, setProducer, setTechrider]);

  // Auto-scroll when URL has hash anchor (e.g. /#press-kit or /#upcoming)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  const bio = biography || defaultKrysoBiography;
  const bioImageUrl = formatImageUrl(bio.imageUrl || "https://drive.google.com/file/d/1KivN_SsCYal3jJRRTWA-bf52mklOc0nP/view?usp=sharing");

  return (
    <SiteShell>
      {/* ------------------------------------------------------------------ */}
      {/* 0. FIXED PAGE BACKGROUND IMAGE (NON-MOVING ON SCROLL, ADMIN MANAGED)*/}
      {/* ------------------------------------------------------------------ */}
      {config?.backgroundImageUrl && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={formatImageUrl(config.backgroundImageUrl)}
            alt="Kryso Page Background"
            className="size-full object-cover object-center"
            style={{
              filter: config.backgroundBlur ? `blur(${config.backgroundBlur}px)` : undefined,
              transform: config.backgroundBlur ? "scale(1.05)" : undefined,
            }}
          />
          {/* Dark Overlay for Readability */}
          <div
            className="absolute inset-0 bg-[#030712]"
            style={{
              opacity:
                config.backgroundOverlayOpacity !== undefined
                  ? config.backgroundOverlayOpacity / 100
                  : 0.82,
            }}
          />
          {/* Ambient Top & Bottom Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        </div>
      )}

      {/* PAGE HERO HEADER FOR ABOUT PAGE */}
      <section className="relative z-10 pt-14 pb-4 text-center page-shell">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest shadow-sm mb-4">
          <Sparkles size={14} className="animate-pulse" />
          <span>The Artist Journey & Sonic Legacy</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-200">KRYSO</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          International DJ, electronic music producer, sound architect, and mentor crafting energetic festival soundscapes and empowering next-gen music producers.
        </p>
      </section>

      {/* 2. KRYSO ARTIST BIOGRAPHY SECTION                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-10 bg-gradient-to-b from-[#030712]/90 via-[#0B152B]/60 to-[#030712]/90 py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden backdrop-blur-xs">
        {/* Ambient Stage & Navy Lighting */}
        <div className="pointer-events-none absolute top-1/3 left-10 size-[500px] rounded-full bg-amber-500/10 blur-[150px] -z-10" />
        <div className="pointer-events-none absolute bottom-10 right-10 size-[450px] rounded-full bg-blue-600/15 blur-[140px] -z-10" />

        <div className="page-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* SIDE IMAGE (Left 5 Cols) */}
            <div className="lg:col-span-5 relative max-w-md mx-auto lg:max-w-none w-full">
              <div className="relative isolate rounded-3xl overflow-hidden border-2 border-blue-900/60 bg-[#0B152B]/90 shadow-2xl group hover:border-amber-500/60 transition-all duration-500">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#070F1E]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bioImageUrl}
                    alt={bio.name || "Kryso"}
                    className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-hero.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-85" />

                  {/* Badge Overlays on Image */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B152B]/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-amber-400 border border-amber-500/40 shadow-lg">
                      <Mic2 size={13} className="text-amber-400 animate-pulse" />
                      <span>{bio.role || "Rapper & Singer"}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-display text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                      {bio.name || "Kryso"}
                    </p>
                    <p className="text-xs text-blue-200/90 font-semibold mt-0.5 drop-shadow">
                      Pune, Maharashtra · Founder of Kryso Music Academy
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Navy & Orange Glow Ring */}
              <div className="pointer-events-none absolute -inset-2 rounded-[32px] bg-gradient-to-r from-amber-500/20 via-blue-600/20 to-amber-500/20 blur-xl -z-10" />
            </div>

            {/* BIOGRAPHY CONTENT (Right 7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-400 mb-3 shadow-xs">
                  <Sparkles size={13} />
                  <span>ARTIST BIOGRAPHY</span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">{bio.name || "Kryso"}</span>
                </h2>

                <p className="mt-2 font-display text-base sm:text-lg font-bold text-amber-400/95">
                  {bio.tagline || "Rapper, Singer, Songwriter & Music Producer"}
                </p>
              </div>

              {/* Biography Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm md:text-base leading-relaxed text-blue-100/80">
                <p>
                  {bio.bioParagraph1 ||
                    "Kryso is an Indian rapper, singer, songwriter, and visionary music producer known for blending lyrical storytelling, explosive rap cadence, and melodic vocal hooks. Driven by a deep passion for musical experimentation, Kryso transforms raw street emotion and contemporary rhythms into chart-ready anthems."}
                </p>
                <p>
                  {bio.bioParagraph2 ||
                    "From rocking electrifying live concert stages to crafting immersive studio soundscapes, Kryso has built a distinct sonic identity across Hip-Hop, Pop, and Electronic genres. As the creative force behind Kryso Music Academy in Pune, he mentors the next generation of vocalists, rappers, and music creators with hands-on studio training and live stage discipline."}
                </p>
                {bio.bioParagraph3 && (
                  <p>{bio.bioParagraph3}</p>
                )}
              </div>

              {/* Social / Streaming Links & Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-blue-900/40">
                {bio.spotifyUrl && (
                  <a
                    href={bio.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold px-5 h-11 text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                  >
                    <SpotifyIcon size={16} />
                    <span>Listen on Spotify</span>
                  </a>
                )}

                {bio.youtubeUrl && (
                  <a
                    href={bio.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-900/60 bg-[#0B152B]/90 hover:bg-[#0E1A34] text-white px-4 h-11 text-xs sm:text-sm font-bold transition-all hover:border-amber-500/40"
                  >
                    <Youtube size={16} className="text-red-500" />
                    <span>YouTube</span>
                  </a>
                )}

                {bio.instagramUrl && (
                  <a
                    href={bio.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-900/60 bg-[#0B152B]/90 hover:bg-[#0E1A34] text-white px-4 h-11 text-xs sm:text-sm font-bold transition-all hover:border-amber-500/40"
                  >
                    <Instagram size={16} className="text-pink-500" />
                    <span>Instagram</span>
                  </a>
                )}

                <Link href="/academy">
                  <Button
                    variant="outline"
                    className="h-11 rounded-full px-5 border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500 hover:text-black font-extrabold text-xs sm:text-sm cursor-pointer transition-all shadow-xs"
                  >
                    <span>Explore Academy</span>
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. KRYSO DJ/MUSIC PRODUCER SECTION                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-10 isolate py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden bg-black/85 backdrop-blur-xs text-white">
        {/* Background Presskit Image with dark gradient overlays for pristine readability */}
        <div className="absolute inset-0 -z-20">
          <Image
            src={formatImageUrl(producer?.bgImageUrl || defaultKrysoProducerData.bgImageUrl)}
            alt={producer?.title || "Kryso DJ / Music Producer"}
            fill
            priority
            unoptimized
            className="object-cover object-center sm:object-right-top brightness-60 contrast-110 opacity-30 sm:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-[#0B152B]/85 to-black/75 sm:to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/90" />
        </div>

        {/* Atmospheric Navy & Orange Glow */}
        <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 size-[500px] rounded-full bg-blue-600/15 blur-[160px] -z-10" />
        <div className="pointer-events-none absolute left-10 top-1/3 size-[400px] rounded-full bg-amber-500/15 blur-[150px] -z-10" />

        <div className="page-shell relative z-10">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-blue-900/40">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-400 shadow-xs">
                <Sliders size={13} />
                <span>{producer?.badge || defaultKrysoProducerData.badge}</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {producer?.title?.includes("DJ") ? (
                  <>
                    {producer.title.split("DJ")[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">DJ{producer.title.split("DJ")[1]}</span>
                  </>
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">{producer?.title || defaultKrysoProducerData.title}</span>
                )}
              </h2>

              <p className="text-sm sm:text-base text-blue-100/80 leading-relaxed">
                {producer?.description || defaultKrysoProducerData.description}
              </p>
            </div>

            {/* Explore KRYSO Music Action Button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link href="/music">
                <Button className="w-full sm:w-auto h-12 rounded-full px-8 font-extrabold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 text-black shadow-xl shadow-amber-500/25 text-sm cursor-pointer transition-all hover:scale-105 border border-amber-300/60 animate-border-glow-orange">
                  <Disc3 size={17} className="mr-2 animate-spin" style={{ animationDuration: "8s" }} />
                  <span>Explore KRYSO Music</span>
                  <ArrowRight size={15} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* INDUSTRY CREDENTIALS SHOWCASE CARD (Labels, TV Features, Supported By, Streaming) */}
          <div className="mt-10 rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-amber-500/15 blur-3xl -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left: Presskit Visual Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border-2 border-blue-900/70 shadow-2xl bg-[#070F1E] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(producer?.bgImageUrl || "/kryso-music-producer-presskit.png")}
                    alt={producer?.title || "Kryso DJ / Music Producer"}
                    className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B152B]/90 backdrop-blur-md border border-amber-500/40 text-[11px] font-black uppercase tracking-wider text-amber-400">
                      <Disc3 size={12} className="text-amber-400" />
                      <span>OFFICIAL PRESSKIT</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-200/70 uppercase tracking-widest">
                      VERIFIED ARTIST
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Detailed Credentials Grid */}
              <div className="lg:col-span-7 space-y-7">
                {/* Header Tag */}
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                    [ {producer?.title?.toUpperCase() || "KRYSO AS A MUSIC PRODUCER"} ]
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                    {producer?.subtitle || defaultKrysoProducerData.subtitle}
                  </h3>
                </div>

                {/* 1. [MUSIC] / RECORD LABELS */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-200/80 flex items-center gap-2">
                    <Disc3 size={14} className="text-amber-400" /> [ MUSIC & RECORD LABELS ]
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(producer?.recordLabels && producer.recordLabels.length > 0
                      ? producer.recordLabels
                      : defaultKrysoProducerData.recordLabels
                    ).map((label) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 rounded-xl border border-blue-900/50 bg-[#070F1E]/80 px-3.5 py-2.5 text-xs font-extrabold text-white hover:border-amber-500/50 hover:bg-amber-500/10 transition-all"
                      >
                        <span className="size-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                        <span className="truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. [FEATURED ON TV CHANNELS] */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-200/80 flex items-center gap-2">
                    <Tv size={14} className="text-amber-400" /> [ FEATURED ON TV CHANNELS ]
                  </span>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-1">
                    {(() => {
                      const list = producer?.tvFeatures && producer.tvFeatures.length > 0
                        ? producer.tvFeatures
                        : defaultKrysoProducerData.tvFeatures;
                      const hasSony = list.some((item) => item.toLowerCase().includes("sony"));
                      return hasSony ? list : [...list, "Sony"];
                    })().map((tv) => {
                      const lower = tv.toLowerCase();
                      if (lower.includes("mtv")) {
                        return (
                          <div key={tv} title="MTV" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                            <svg viewBox="0 0 265 164" className="h-7 w-auto" fill="#ffffff" aria-label="MTV">
                              <g transform="translate(-19.826464,201.34222)">
                                <path fill="#ffffff" fillRule="nonzero" d="m 206.51128,-37.814543 c -0.48752,-4.074263 -1.07951,-9.959309 -1.07951,-15.147901 0,-3.203694 0.4527,-16.15776 0.4527,-26.569765 0,-8.775336 -1.91525,-24.410751 -1.91525,-32.872681 0,-5.11895 0.38305,-12.01386 -0.17412,-14.45145 4.07427,-2.64653 7.62619,-4.35285 18.83912,-11.10846 3.62156,-2.22866 10.55129,-5.91987 10.55129,-10.41201 0,-1.98489 -0.52234,-3.27334 -3.34298,-5.60646 -1.95008,-1.56702 -4.07426,-2.01972 -6.47703,-2.01972 -5.71094,0 -8.28782,5.71093 -13.09336,8.67087 -7.31278,4.45731 -11.17811,6.65114 -12.67549,7.48689 -0.59198,-0.27858 -3.09922,-1.74114 -7.10384,-1.74114 -4.17873,0 -9.01909,1.88043 -9.01909,7.31278 0,2.47242 0.7661,5.18859 -2.54207,6.92973 -1.88042,1.18397 -10.96917,6.37257 -20.64989,12.22279 -8.14853,4.91001 -11.94421,4.52696 -15.39166,6.5815 -3.16887,1.91525 -4.00462,4.31802 -4.00462,6.37257 0,1.8456 1.14915,4.178728 1.56702,4.701069 2.19384,2.785821 4.14391,4.318022 7.59137,4.318022 5.85022,0 10.72541,-5.118945 19.7445,-11.526331 5.64129,-4.00462 10.79506,-8.18335 13.82464,-8.18335 2.71617,0 4.5966,2.05454 4.5966,10.412 0,28.067149 -1.70631,32.524462 -1.70631,51.955562 0,3.517099 0.13929,9.994132 0.24375,12.675485 h -14.86931 v -45.93122 l -28.62431,24.132172 -28.65913,-24.132172 v 45.93122 H 19.826464 V -201.34222 H 110.1567 l 31.09673,32.73339 31.0619,-32.73339 h 90.81776 v 69.9241 c -2.85547,4.42249 -11.6308,19.46592 -17.55067,34.822758 -1.91526,5.014478 -2.82065,8.636045 -5.36271,8.636045 -2.78582,0 -3.02958,-2.750998 -3.30816,-5.258237 -0.55716,-5.362705 -1.77596,-15.391656 -2.33313,-19.117696 -1.0795,-7.13867 -2.47241,-14.6952 -10.48165,-14.6952 -5.91987,0 -12.11832,3.23851 -12.11832,12.08349 0,5.01448 2.54206,13.72017 6.89491,25.176859 1.70632,4.526959 10.79506,28.380549 12.11832,31.828003 2.40277,6.302919 5.71093,8.044057 10.93435,8.044057 6.65114,0 8.94945,-2.437593 11.66562,-11.770093 2.33313,-7.939589 6.2681,-20.893656 9.54144,-29.042181 0,0 0,0 0,0 v 52.895772 z m 77.89851,-90.748117 v 90.748117 h -14.93896 v -66.407007 c 3.20369,-6.8949 10.89952,-19.01322 14.93896,-24.34111 m -14.93896,-12.11832 v -60.66124 l 14.93896,8.98427 v 33.22091 c -3.65639,3.8305 -11.35222,13.163 -14.93896,18.45606 m -119.99923,-45.79193 -8.21817,8.67087 -22.28657,-23.43572 28.27608,12.43173 z m 1.00986,127.346838 h 10.27271 l 2.78582,-2.333125 v -8.670867 z m -31.54942,21.311529 h 12.29243 v -21.973162 l -12.29243,-10.342359 z" />
                              </g>
                            </svg>
                          </div>
                        );
                      }
                      if (lower.includes("vh1")) {
                        return (
                          <div key={tv} title="Vh1" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                            <svg viewBox="65 92 840 330" className="h-7 w-auto" fill="#ffffff" aria-label="Vh1">
                              <path fill="#ffffff" fillRule="evenodd" d="M70.64,93.51h90.09a8.7,8.7,0,0,1,7.82,5.79l50.66,164.14a2.25,2.25,0,0,0,2.12,1.46,2.33,2.33,0,0,0,2.11-1.46L274.1,99.3a8.66,8.66,0,0,1,7.8-5.79H467.61a6.07,6.07,0,0,1,6.05,6.09V207.92h78.61a6.06,6.06,0,0,0,6-6V99.55a6.1,6.1,0,0,1,6.05-6h85a6.11,6.11,0,0,1,6.1,6V201.88a6.07,6.07,0,0,0,6,6h88.53v-62a11.83,11.83,0,0,1,4.92-9.54L807.53,97a19.11,19.11,0,0,1,11.08-3.47h77.31a6.06,6.06,0,0,1,6,6.09V413.47a6.07,6.07,0,0,1-6,6H810.8a6.06,6.06,0,0,1-6-6V214a6.1,6.1,0,0,0-6-6.05H750.08v91.14a6.07,6.07,0,0,1-6.1,6H661.5a6.07,6.07,0,0,0-6,6.1V413.47a6.11,6.11,0,0,1-6.1,6h-85a6.07,6.07,0,0,1-6.05-6V311.2a6.11,6.11,0,0,0-6-6.1H473.66V413.47a6.07,6.07,0,0,1-6.05,6h-85.1a6,6,0,0,1-6-6v-303a2.35,2.35,0,0,0-2.16-2.06,2.26,2.26,0,0,0-2.17,1.56L263.42,413.82a9.27,9.27,0,0,1-8.11,5.7h-68a9.24,9.24,0,0,1-8.1-5.7L66.67,99.25c-1.16-3.17.65-5.74,4-5.74Z" />
                            </svg>
                          </div>
                        );
                      }
                      if (lower.includes("9xm")) {
                        return (
                          <div key={tv} title="9XM" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                            <img src="/logos/tv/9xm-original-clean.png" alt="9XM" className="h-8 w-auto object-contain" />
                          </div>
                        );
                      }
                      if (lower.includes("zoom")) {
                        return (
                          <div key={tv} title="ZOOM TV" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                            <img src="/logos/tv/zoom-original-white.png" alt="ZOOM TV" className="h-7 w-auto object-contain" />
                          </div>
                        );
                      }
                      if (lower.includes("zee")) {
                        return (
                          <div key={tv} title="Zee Music Company" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                            <img src="/logos/tv/zee-music-white.svg" alt="Zee Music Company" className="h-7 w-auto object-contain" />
                          </div>
                        );
                      }
                      if (lower.includes("sony")) {
                        return (
                          <div key={tv} title="Sony Music" className="flex items-center justify-center hover:opacity-80 transition-opacity">
                            <img src="/logos/tv/sony-music-white.png" alt="Sony Music" className="h-[25px] w-auto object-contain" />
                          </div>
                        );
                      }
                      return (
                        <div key={tv} className="flex items-center gap-2 font-black text-sm tracking-wider text-white/90">
                          <span className="size-2 rounded-full bg-blue-400" />
                          <span>{tv}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. [MUSIC SUPPORTED BY] */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-200/80 flex items-center gap-2">
                    <Flame size={14} className="text-amber-500" /> [ MUSIC SUPPORTED BY ]
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {(producer?.artistSupporters && producer.artistSupporters.length > 0
                      ? producer.artistSupporters
                      : defaultKrysoProducerData.artistSupporters
                    ).map((artist) => (
                      <span
                        key={artist}
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300 shadow-xs hover:border-amber-500 hover:bg-amber-500/20 transition-all"
                      >
                        <Sparkles size={11} className="text-amber-400" />
                        <span>{artist}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. STREAMING EVERYWHERE */}
                <div className="pt-2 border-t border-blue-900/40 flex flex-wrap items-center gap-2 text-blue-200/80">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-200/70 mr-1">
                    STREAMING ON:
                  </span>
                  {(producer?.streamingPlatforms && producer.streamingPlatforms.length > 0
                    ? producer.streamingPlatforms
                    : defaultKrysoProducerData.streamingPlatforms
                  ).map((platform) => (
                    <span
                      key={platform.name}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#070F1E]/90 border border-blue-900/60 text-[11px] font-bold text-white"
                    >
                      <span className={`size-1.5 rounded-full ${platform.color ? platform.color.replace("text-", "bg-") : "bg-amber-500"}`} />
                      <span className={platform.color || "text-white"}>{platform.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. KRYSO SHOWS & FESTIVALS SECTION                                 */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="upcoming"
        className="scroll-mt-24 relative z-10 isolate bg-[#030712]/90 backdrop-blur-xs text-white py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden"
      >
        <span id="shows" className="block -mt-24 pt-24 invisible pointer-events-none" />
        {/* Shows Section Dynamic Background Image from Admin Panel */}
        {shows?.bgImageUrl && (
          <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formatImageUrl(shows.bgImageUrl)}
              alt="Kryso Shows Live Stage Background"
              style={{
                objectPosition: `${shows?.bgPositionX ?? 50}% ${shows?.bgPositionY ?? 50}%`,
                transform: `scale(${(shows?.bgZoom ?? 100) / 100})`,
                transformOrigin: `${shows?.bgPositionX ?? 50}% ${shows?.bgPositionY ?? 50}%`,
                filter: `brightness(${shows?.bgBrightness ?? 95}%) contrast(${shows?.bgContrast ?? 110}%) blur(${shows?.bgBlur ?? 0}px)`,
                opacity: (shows?.bgOpacity ?? 30) / 100,
              }}
              className="size-full object-cover transition-all duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/95 via-[#030712]/80 to-[#030712]/95 backdrop-blur-[1px]" />
          </div>
        )}

        {/* Stage Concert Atmosphere & Orange/Navy Glow Lights */}
        <div className="pointer-events-none absolute top-0 left-1/4 size-[600px] rounded-full bg-blue-600/10 blur-[180px] -z-10" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 size-[500px] rounded-full bg-amber-500/10 blur-[160px] -z-10" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-black -z-10" />

        <div className="page-shell space-y-12 sm:space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-400">
              <Flame size={14} className="animate-pulse text-amber-500" />
              <span>{shows?.badge || defaultKrysoShowsData.badge || "LIVE CONCERTS & TOURS"}</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg">
              {shows?.title || defaultKrysoShowsData.title}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                {shows?.titleHighlight || defaultKrysoShowsData.titleHighlight || "SHOWS"}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-blue-200/80 leading-relaxed font-medium">
              {shows?.subtitle || defaultKrysoShowsData.subtitle}
            </p>

            {/* Optional Admin-Configurable Shows Action Link / Drive Link */}
            {shows?.bgLinkUrl && (
              <div className="pt-2 flex items-center justify-center">
                <a
                  href={shows.bgLinkUrl}
                  target={shows.bgLinkUrl.startsWith("http") ? "_blank" : undefined}
                  rel={shows.bgLinkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 text-black font-extrabold px-6 py-2.5 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-105 cursor-pointer animate-border-glow-orange border border-amber-300/60"
                >
                  <span>{shows.bgLinkText || "View Tour Highlights / Gallery"}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* UPCOMING EVENTS SLOT (ENABLE / DISABLE ANYTIME VIA ADMIN PANEL)   */}
          {/* ================================================================ */}
          {shows?.upcomingEventsEnabled !== false && (() => {
            const rawEvents = shows?.upcomingEvents || defaultKrysoShowsData.upcomingEvents || [];
            const activeEvents = rawEvents.filter((ev) => ev.isEnabled !== false);

            if (activeEvents.length === 0) return null;

            return (
              <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#0B152B]/95 via-[#070F1E]/90 to-[#030712] p-6 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Ambient glow accent */}
                <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-amber-500/15 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-blue-600/15 blur-[120px]" />

                {/* Upcoming Events Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-blue-900/60 mb-8">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-400">
                      <Calendar size={13} className="text-amber-400" />
                      <span>{shows?.upcomingEventsBadge || defaultKrysoShowsData.upcomingEventsBadge || "TOUR & GIG CALENDAR 2026"}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                      {shows?.upcomingEventsHeading || defaultKrysoShowsData.upcomingEventsHeading || "UPCOMING SHOWS & FESTIVAL DATES"}
                    </h3>

                    <p className="text-xs sm:text-sm text-blue-200/80 max-w-2xl leading-relaxed">
                      {shows?.upcomingEventsSubtext || defaultKrysoShowsData.upcomingEventsSubtext}
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3.5 py-1.5 text-xs font-black text-amber-400">
                      <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                      <span>{activeEvents.length} Active Gigs</span>
                    </span>

                    <a
                      href="https://wa.me/918767828945?text=Hi%20KRYSO%20Team%2C%20I%20am%20inquiring%20about%20upcoming%20tour%20events%20and%20gig%20bookings."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold px-3.5 py-1.5 text-xs tracking-wider transition-all duration-300 animate-border-glow-whatsapp"
                    >
                      <MessageCircle size={13} className="fill-current text-black" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href="tel:+918767828945"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3.5 py-1.5 text-xs tracking-wider transition-all duration-300 animate-border-glow-call"
                    >
                      <Phone size={13} />
                      <span>Call Now</span>
                    </a>
                  </div>
                </div>

                {/* Upcoming Events Cards List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {activeEvents.map((event) => {
                    const isSoldOut = event.status === "sold_out";
                    const isSellingFast = event.status === "selling_fast";
                    const isComingSoon = event.status === "announcing_soon";
                    const isFreeEntry = event.status === "free_entry";

                    return (
                      <div
                        key={event.id}
                        className="group flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-2xl border border-blue-900/60 bg-[#070F1E]/90 hover:bg-[#0B152B] hover:border-amber-500/60 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                      >
                        {/* Left: Date Block & Poster Artwork */}
                        <div className="relative overflow-hidden flex sm:flex-col items-center justify-between sm:justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 p-3 sm:p-4 text-center sm:min-w-[110px] shrink-0 group/poster">
                          {event.posterUrl && (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={formatImageUrl(event.posterUrl)}
                                alt={event.title}
                                className="absolute inset-0 size-full object-cover object-center opacity-30 group-hover/poster:scale-110 transition-transform duration-500 pointer-events-none"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 bg-[#070F1E]/60 backdrop-blur-[0.5px] pointer-events-none" />
                            </>
                          )}
                          <span className="relative z-10 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
                            {event.day || "LIVE"}
                          </span>
                          <span className="relative z-10 font-display text-lg sm:text-2xl font-black text-white tracking-tight leading-tight my-0.5">
                            {event.date}
                          </span>
                          {event.time && (
                            <span className="relative z-10 inline-flex items-center gap-1 text-[10px] font-bold text-blue-200/70 sm:mt-1">
                              <Clock size={10} className="text-amber-400" />
                              <span>{event.time}</span>
                            </span>
                          )}
                        </div>

                        {/* Middle: Event Details */}
                        <div className="flex flex-1 flex-col justify-between min-w-0 space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {event.category && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-900/60 border border-blue-800/80 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                                  {event.category}
                                </span>
                              )}

                              {/* Status Badges */}
                              {isSellingFast && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-[10px] font-black uppercase tracking-wider text-amber-400 animate-pulse">
                                  <Flame size={10} className="fill-current text-amber-500" />
                                  <span>Selling Fast</span>
                                </span>
                              )}
                              {isSoldOut && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider text-rose-300">
                                  <span>Sold Out</span>
                                </span>
                              )}
                              {isComingSoon && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider text-purple-300">
                                  <Sparkles size={10} />
                                  <span>Coming Soon</span>
                                </span>
                              )}
                              {isFreeEntry && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                                  <span>Free Entry</span>
                                </span>
                              )}
                            </div>

                            <h4 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                              {event.title}
                            </h4>

                            <div className="flex items-center gap-1.5 text-xs text-blue-200/80">
                              <MapPin size={13} className="text-amber-400 shrink-0" />
                              <span className="font-medium truncate">
                                {event.venue}{event.city ? ` • ${event.city}` : ""}
                              </span>
                            </div>
                          </div>

                          {/* Right / Bottom Action */}
                          <div className="pt-2 sm:pt-0 flex items-center justify-between gap-3">
                            {isSoldOut ? (
                              <button
                                type="button"
                                disabled
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-950/60 border border-blue-900/60 text-blue-400/60 px-4 py-2 text-xs font-bold cursor-not-allowed opacity-75"
                              >
                                <span>Sold Out</span>
                              </button>
                            ) : event.ticketUrl ? (
                              <a
                                href={event.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-2 text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
                              >
                                <Ticket size={13} />
                                <span>{event.ticketLabel || "Get Tickets"}</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <Link
                                href="/contact"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-blue-800/80 bg-[#0B152B]/80 hover:bg-blue-900/60 text-white px-4 py-2 text-xs font-bold transition-colors"
                              >
                                <span>Inquire / RSVP</span>
                                <ArrowRight size={12} className="text-amber-400" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Video Player Modal (for Techrider / Media video playback) */}
      {activeVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl border border-blue-900/80 bg-[#0B152B] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-blue-900/60 bg-[#070F1E]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0">
                  <FileVideo size={11} /> VIDEO
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-white truncate">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="size-8 rounded-full bg-blue-950/80 hover:bg-blue-900 text-blue-200 hover:text-white grid place-items-center transition-colors cursor-pointer shrink-0 ml-2"
                aria-label="Close video player"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Stream Player */}
            <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={(el) => {
                  if (el) {
                    el.playsInline = true;
                    el.defaultMuted = false;
                    const p = el.play();
                    if (p !== undefined) {
                      p.catch(() => {
                        el.muted = true;
                        el.play().catch(() => {});
                      });
                    }
                  }
                }}
                src={formatVideoUrl(activeVideoModal.driveUrl)}
                controls
                autoPlay
                playsInline
                className="size-full object-contain"
              />
            </div>

            {/* Modal Footer Info & Download Action */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B152B]">
              <div className="space-y-1 max-w-xl">
                {activeVideoModal.category && (
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    {activeVideoModal.category} {activeVideoModal.fileSize ? `• ${activeVideoModal.fileSize}` : ""}
                  </p>
                )}
                {activeVideoModal.description && (
                  <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed">
                    {activeVideoModal.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={activeVideoModal.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-2.5 text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  <Download size={15} />
                  <span>Download</span>
                  <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="rounded-full border border-blue-900/60 bg-[#070F1E] hover:bg-blue-950 px-5 py-2.5 text-xs sm:text-sm font-semibold text-blue-200 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ------------------------------------------------------------------ */}
      {/* 6. KRYSO MEDIA KIT & TECHRIDER SECTION                             */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="press-kit"
        className="scroll-mt-24 relative z-10 isolate bg-[#030712]/85 backdrop-blur-xs py-16 sm:py-24 border-b border-blue-900/40 overflow-hidden"
      >
        <span id="techrider" className="block -mt-24 pt-24 invisible pointer-events-none" />
        <span id="presskit" className="block -mt-24 pt-24 invisible pointer-events-none" />
        {/* Ambient background glow matching navy and warm orange lights */}
        <div className="pointer-events-none absolute top-12 left-10 size-[500px] rounded-full bg-blue-600/10 blur-[160px] -z-10" />
        <div className="pointer-events-none absolute bottom-10 right-10 size-[450px] rounded-full bg-amber-500/10 blur-[150px] -z-10" />

        <div className="page-shell space-y-12">
          {/* Section Header: Kryso Media Kit */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-blue-900/40">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-400">
                <Sliders size={13} />
                <span>OFFICIAL PRESS & TECHNICAL SPECIFICATIONS</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Kryso <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Media Kit</span>
              </h2>
              <p className="text-sm sm:text-base text-blue-200/80 leading-relaxed">
                Official stage technical requirements, DJ gear checklist, high-resolution press assets, and downloadable promotional media kits for festivals, clubs, and promoter bookings.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={techrider?.bookingPhone ? `tel:${techrider.bookingPhone.replace(/\s+/g, "")}` : "tel:+918767828945"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition-transform hover:scale-105 shadow-lg shadow-amber-500/25"
              >
                <Phone size={16} />
                <span>Book Kryso Now</span>
              </a>
            </div>
          </div>

          {/* Main Grid: Left image poster card + Right specs & two cards for image and video */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Presskit Visual Card */}
            <div className="lg:col-span-5 relative group">
              <div className="relative overflow-hidden rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 shadow-2xl backdrop-blur-md">
                <a
                  href="/Kryso_Stage_Technical_Rider_Final.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-[3/4] w-full overflow-hidden cursor-pointer block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formatImageUrl(techrider?.posterImageUrl || defaultKrysoTechriderData.posterImageUrl)}
                    alt={techrider?.posterTitle || "Kryso Media Kit & Press Card"}
                    className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.currentTarget.src = "/kryso-techrider-contact.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-[#0B152B]/90 backdrop-blur-md px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-400 shadow-md">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Official Press Spec</span>
                  </div>

                  {/* Hover Quick Preview Button */}
                  <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 text-black font-extrabold px-4 py-2 text-xs uppercase tracking-wider shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Eye size={14} />
                      <span>Preview PDF</span>
                    </span>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#0B152B]/90 backdrop-blur-md border border-blue-900/60 space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">{techrider?.posterSubtitle || defaultKrysoTechriderData.posterSubtitle}</p>
                    <p className="text-lg font-black text-white leading-snug">{techrider?.posterTitle || defaultKrysoTechriderData.posterTitle}</p>
                    <div className="flex items-center justify-between text-xs text-blue-200/80 pt-1">
                      <span>Pro Audio & Visual Rider</span>
                      <span className="text-amber-400 font-bold">Standard Stage Setup</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right: Techrider Specs + Action Buttons + 2 Cards for Image & Video */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card 1: [TECHRIDER] Stage Technical Requirements with Preview & Download buttons */}
              <div className="rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 p-6 sm:p-7 backdrop-blur-md relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                      <Sliders size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">[TECHRIDER]</span>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{techrider?.techriderTitle || defaultKrysoTechriderData.techriderTitle}</h3>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <CheckCircle2 size={13} className="text-amber-400" />
                    Mandatory
                  </span>
                </div>

                {/* Tech Specs Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(techrider?.techriderItems && techrider.techriderItems.length > 0
                    ? techrider.techriderItems
                    : defaultKrysoTechriderData.techriderItems
                  ).map((item, idx) => {
                    const isWide = idx >= 2 || item.spec.length > 30;
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-3.5 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-amber-500/40 transition-all flex items-start gap-3 group ${
                          isWide ? "sm:col-span-2" : ""
                        }`}
                      >
                        <div className="size-7 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 font-mono font-black text-xs group-hover:scale-110 transition-transform">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/70">{item.category}</p>
                          <p className="text-xs sm:text-sm font-black text-white tracking-wide">{item.spec}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Preview and Download Buttons */}
                <div className="pt-4 mt-5 border-t border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href="/Kryso_Stage_Technical_Rider_Final.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Eye size={14} className="text-amber-400" />
                    <span>Preview Rider</span>
                  </a>
                  <a
                    href="/Kryso_Stage_Technical_Rider_Final.pdf"
                    download="Kryso_Stage_Technical_Rider_Final.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-md shadow-amber-500/20"
                  >
                    <Download size={14} />
                    <span>Download Techrider</span>
                  </a>
                </div>
              </div>

              {/* Two cards: Card 4 (Image) & Card 3 (Video) moved from Downloads */}
              {(() => {
                const allItems = downloads && downloads.length > 0 ? downloads : defaultKrysoDownloads;
                // Item 3 and Item 4 from downloads
                const item3 = allItems[2] || defaultKrysoDownloads[3]; // KRYSO KJSC Festival Aftermovie 4K (VIDEO)
                const item4 = allItems[3] || defaultKrysoDownloads[0]; // Official Press Kit & 4K Portraits (IMAGE)

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 4: Official Press Kit & 4K Portraits (IMAGE) */}
                    <div className="group relative flex flex-col justify-between rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-amber-500/60 transition-all duration-300 hover:-translate-y-1">
                      <a
                        href={item4?.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-[16/10] w-full overflow-hidden bg-[#070F1E] block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formatImageUrl(item4?.thumbnailUrl || "/kryso-hero.jpg")}
                          alt={item4?.title || "Press Kit"}
                          className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/kryso-hero.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md bg-amber-500 text-black border-amber-400/50">
                            <ImageIcon size={11} />
                            <span>IMAGE</span>
                          </span>
                        </div>
                        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 text-black font-extrabold px-3.5 py-1.5 text-xs uppercase tracking-wider shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                            <Download size={13} />
                            <span>Download</span>
                            <ExternalLink size={11} />
                          </span>
                        </div>
                      </a>

                      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            {item4?.category || "PRESS PHOTOS"}
                          </span>
                          <h4 className="font-display text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
                            {item4?.title || "Official Press Kit & 4K Portraits"}
                          </h4>
                          <p className="text-xs text-blue-200/70 line-clamp-2 leading-relaxed">
                            {item4?.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:underline">
                          <a
                            href={item4?.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between w-full hover:underline"
                          >
                            <span className="flex items-center gap-1.5">
                              <Download size={13} />
                              <span>Download</span>
                            </span>
                            <ExternalLink size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: KRYSO KJSC Festival Aftermovie 4K (VIDEO) */}
                    <div className="group relative flex flex-col justify-between rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 overflow-hidden shadow-lg hover:shadow-2xl hover:border-amber-500/60 transition-all duration-300 hover:-translate-y-1">
                      <div
                        onClick={() => item3 && setActiveVideoModal(item3)}
                        className="relative aspect-[16/10] w-full overflow-hidden bg-[#070F1E] cursor-pointer"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formatImageUrl(item3?.thumbnailUrl || "/kryso-hero.jpg")}
                          alt={item3?.title || "Festival Aftermovie"}
                          className="size-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/kryso-hero.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md bg-amber-500/90 text-black border-amber-400/50">
                            <FileVideo size={11} />
                            <span>VIDEO</span>
                          </span>
                        </div>
                        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-xl transform scale-90 group-hover:scale-100 transition-all">
                            <Play size={13} className="fill-current" />
                            <span>Play Video</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            {item3?.category || "RECAP VIDEOS"}
                          </span>
                          <h4
                            onClick={() => item3 && setActiveVideoModal(item3)}
                            className="font-display text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            {item3?.title || "KRYSO KJSC Festival Aftermovie 4K"}
                          </h4>
                          <p className="text-xs text-blue-200/70 line-clamp-2 leading-relaxed">
                            {item3?.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-blue-900/50 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:underline">
                          <a
                            href={item3?.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between w-full hover:underline"
                          >
                            <span className="flex items-center gap-1.5">
                              <Download size={13} />
                              <span>Download</span>
                            </span>
                            <ExternalLink size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. KRYSO DIRECT CONTACT & BOOKINGS SECTION                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="contact" className="relative z-10 isolate bg-[#030712]/90 backdrop-blur-xs py-16 sm:py-20 border-t border-blue-900/40 overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-amber-500/10 blur-[170px] -z-10" />

        <div className="page-shell">
          <div className="rounded-3xl border border-blue-900/60 bg-[#0B152B]/90 p-6 sm:p-10 backdrop-blur-md relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4 mb-8 pb-5 border-b border-blue-900/50">
              <div className="flex items-center gap-3.5">
                <div className="size-11 sm:size-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Phone size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">[CONTACT]</span>
                  <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    {techrider?.contactTitle || defaultKrysoTechriderData.contactTitle}
                  </h3>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                Available Worldwide
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone / Bookings */}
              <a
                href={techrider?.bookingPhone ? `tel:${techrider.bookingPhone.replace(/\s+/g, "")}` : "tel:+918767828945"}
                className="p-5 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-amber-500/50 hover:bg-[#070F1E] transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">FOR BOOKINGS</p>
                  <p className="text-base sm:text-lg font-extrabold text-white group-hover:text-amber-400 transition-colors">
                    {techrider?.bookingPhone || defaultKrysoTechriderData.bookingPhone}
                  </p>
                </div>
                <div className="size-9 rounded-full bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-black flex items-center justify-center transition-all shrink-0">
                  <Phone size={16} />
                </div>
              </a>

              {/* Email */}
              <a
                href={techrider?.bookingEmail ? `mailto:${techrider.bookingEmail}` : "mailto:krysomusic@gmail.com"}
                className="p-5 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-amber-500/50 hover:bg-[#070F1E] transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="space-y-1 truncate pr-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">EMAIL INQUIRIES</p>
                  <p className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-400 transition-colors truncate">
                    {techrider?.bookingEmail || defaultKrysoTechriderData.bookingEmail}
                  </p>
                </div>
                <div className="size-9 rounded-full bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-black flex items-center justify-center transition-all shrink-0">
                  <Mail size={16} />
                </div>
              </a>

              {/* Official Website */}
              <a
                href={techrider?.websiteUrl || defaultKrysoTechriderData.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-amber-400/50 hover:bg-[#070F1E] transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="space-y-1 truncate pr-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">OFFICIAL WEBSITE</p>
                  <p className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-400 transition-colors truncate">
                    {techrider?.websiteUrl?.replace(/^https?:\/\//i, "").toUpperCase() || "WWW.KRYSOMUSIC.COM"}
                  </p>
                </div>
                <div className="size-9 rounded-full bg-amber-500/10 group-hover:bg-amber-400 text-amber-400 group-hover:text-black flex items-center justify-center transition-all shrink-0">
                  <Globe size={16} />
                </div>
              </a>

              {/* Social Profiles - Instagram Only */}
              <a
                href={techrider?.instagramUrl || defaultKrysoTechriderData.instagramUrl || "https://instagram.com/_krysomusic"}
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-[#070F1E]/80 border border-blue-900/50 hover:border-pink-500/50 hover:bg-[#070F1E] transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="space-y-1 truncate pr-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-200/70">SOCIAL PROFILES</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-sm sm:text-base font-extrabold text-white group-hover:text-pink-400 transition-colors inline-flex items-center gap-1.5">
                      <span>INSTAGRAM/KRYSO</span>
                      <ExternalLink size={12} className="text-pink-400/80" />
                    </span>
                  </div>
                </div>
                <div className="size-9 rounded-full bg-pink-500/10 group-hover:bg-gradient-to-tr group-hover:from-amber-500 group-hover:via-pink-500 group-hover:to-purple-600 text-pink-400 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                  <Instagram size={16} />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
