"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Facebook,
  Headphones,
  Instagram,
  Loader2,
  Lock,
  Music,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Unlock,
  X,
  Youtube,
  Film,
  Play,
  Pause,
  RotateCw,
  VolumeX,
  CreditCard,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import musicHeroImage from "@/assets/music-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteShell, SectionHeading } from "@/components/kryso-site";
import {
  siteSettings,
  defaultMusicHeaderData,
  defaultMusicTracks,
  type MusicTrack,
  type TrackAccessType,
  getTrackAccessType,
  type MusicHeaderData,
  type MusicVideoItem,
  defaultMusicVideos,
  parseVideoUrl,
  getVideoThumbnail,
} from "@/data/catalog";
import { formatImageUrl, formatAudioUrl } from "@/lib/media-utils";
import { SpotifyIcon } from "@/components/spotify-icon";
import { useStored } from "@/lib/kryso-storage";

const ITEMS_PER_PAGE = 12;


function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function TrackItemCard({
  track,
  accessType,
  isPurchased,
  isUnlocked,
  isDownloading,
  isCurrentAudio,
  isPlayingThisTrack,
  isLoadingAudio,
  currentTime,
  duration,
  onTogglePlay,
  onAction,
  onSeek,
}: {
  track: MusicTrack;
  accessType: "premium" | "social" | "free";
  isPurchased: boolean;
  isUnlocked: boolean;
  isDownloading: boolean;
  isCurrentAudio: boolean;
  isPlayingThisTrack: boolean;
  isLoadingAudio: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onAction: () => void;
  onSeek: (seconds: number) => void;
}) {
  const audioProgress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-3.5 transition-all duration-200 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/10">
      <div>
        {/* Cover Artwork */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border/80 bg-secondary shadow-inner group/art">
          {track.imageUrl && formatImageUrl(track.imageUrl) ? (
            <Image
              src={formatImageUrl(track.imageUrl)}
              alt={track.name || "Music Artwork"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-300 ${
                isPlayingThisTrack ? "scale-105" : "group-hover/art:scale-105"
              }`}
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <Music size={36} />
            </div>
          )}

          {/* Genre & ZIP Tag Pills */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
            {track.genre && (
              <span className="rounded-full bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                {track.genre}
              </span>
            )}
            {track.downloadUrl && (
              <span className="rounded-full bg-amber-500/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-extrabold text-black shadow-sm">
                📦 Master ZIP
              </span>
            )}
          </div>

          {/* Access / Price Status Pill */}
          {accessType === "premium" && (
            <span
              className={`absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold backdrop-blur-md shadow-md ${
                isPurchased
                  ? "bg-emerald-500 text-black border border-emerald-400/50"
                  : "bg-amber-500 text-black border border-amber-400/50"
              }`}
            >
              {isPurchased ? (
                <>
                  <Check size={11} /> Purchased
                </>
              ) : (
                <>
                  <CreditCard size={11} /> ₹{track.price || 99}
                </>
              )}
            </span>
          )}

          {accessType === "social" && (
            <span
              className={`absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold backdrop-blur-md shadow-md ${
                isUnlocked
                  ? "bg-emerald-500 text-black border border-emerald-400/50"
                  : "bg-sky-500 text-black border border-sky-400/50 animate-pulse"
              }`}
            >
              {isUnlocked ? (
                <>
                  <Unlock size={10} /> Unlocked
                </>
              ) : (
                <>
                  <Lock size={10} /> Unlock
                </>
              )}
            </span>
          )}

          {accessType === "free" && (
            <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold backdrop-blur-md shadow-md bg-emerald-500 text-black border border-emerald-400/50">
              <Unlock size={10} /> 100% Free
            </span>
          )}

          {/* Center Play/Pause Overlay Button on Artwork */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            aria-label={isPlayingThisTrack ? "Pause audio" : "Play audio preview"}
            className={`absolute inset-0 grid place-items-center transition-all duration-200 cursor-pointer ${
              isPlayingThisTrack
                ? "bg-black/45 backdrop-blur-[2px] opacity-100"
                : "bg-black/20 opacity-0 group-hover:opacity-100 hover:bg-black/40 backdrop-blur-[1px]"
            }`}
          >
            <div
              className={`grid size-12 sm:size-14 place-items-center rounded-full shadow-2xl transition-all duration-200 ${
                isPlayingThisTrack
                  ? "bg-amber-500 text-black scale-100 ring-4 ring-amber-400/60 shadow-amber-500/50"
                  : "bg-white/95 text-black hover:bg-amber-400 hover:scale-110"
              }`}
            >
              {isLoadingAudio && isCurrentAudio ? (
                <Loader2 size={24} className="animate-spin text-black" />
              ) : isPlayingThisTrack ? (
                <Pause size={24} className="fill-current text-black" />
              ) : (
                <Play size={24} className="fill-current ml-1 text-black" />
              )}
            </div>

            {isPlayingThisTrack && (
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-500/40">
                <span className="flex items-end gap-0.5 h-2.5">
                  <span className="w-0.5 h-full bg-amber-400 animate-pulse" />
                  <span className="w-0.5 h-2 bg-amber-400 animate-pulse delay-75" />
                  <span className="w-0.5 h-3 bg-amber-400 animate-pulse delay-150" />
                </span>
                <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-wider ml-1">
                  Streaming Preview
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Dedicated Interactive Audio Player Bar on Card */}
        <div
          className={`mt-2.5 rounded-xl p-2.5 border transition-all duration-200 ${
            isCurrentAudio && isPlayingThisTrack
              ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5"
              : isCurrentAudio
              ? "bg-secondary/90 border-border"
              : "bg-secondary/50 border-border/70 hover:border-border"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold">
            <button
              type="button"
              onClick={onTogglePlay}
              className="flex items-center gap-1.5 text-foreground hover:text-amber-400 transition-colors cursor-pointer group/btn"
            >
              <span
                className={`grid size-6 place-items-center rounded-full transition-colors ${
                  isPlayingThisTrack
                    ? "bg-amber-500 text-black"
                    : "bg-card border border-border text-foreground group-hover/btn:border-amber-400 group-hover/btn:text-amber-400"
                }`}
              >
                {isLoadingAudio && isCurrentAudio ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : isPlayingThisTrack ? (
                  <Pause size={11} className="fill-current" />
                ) : (
                  <Play size={11} className="fill-current ml-0.5" />
                )}
              </span>
              <span className="truncate">
                {isPlayingThisTrack
                  ? "Now Playing"
                  : isCurrentAudio
                  ? "Preview Paused"
                  : "Play Preview"}
              </span>
            </button>

            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground shrink-0">
              {isCurrentAudio ? (
                <span>
                  {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Volume2 size={11} className="text-amber-400" /> Preview Ready
                </span>
              )}
            </div>
          </div>

          {/* Mini Scrubber Bar if this track is loaded */}
          {isCurrentAudio && (
            <div
              className="relative mt-2 h-1.5 w-full rounded-full bg-background/80 overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                onSeek(pct * (duration || 0));
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-100"
                style={{ width: `${Math.round(audioProgress * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="mt-2.5">
          <h3
            className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-amber-400 transition-colors truncate"
            title={track.name || ""}
          >
            {track.name || (track as unknown as { title?: string }).title || "Untitled Track"}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            Singer / Artist: <span className="font-medium text-foreground">{track.singer || (track as unknown as { artist?: string }).artist || "Kryso"}</span>
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-3 border-t border-border/70 pt-2.5">
        <Button
          onClick={onAction}
          disabled={isDownloading}
          className={`w-full h-9 rounded-lg font-extrabold shadow-sm transition-all text-xs active:scale-[0.98] cursor-pointer ${
            accessType === "premium"
              ? isPurchased
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
              : accessType === "social"
              ? isUnlocked
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                : "bg-sky-500 hover:bg-sky-400 text-black shadow-sky-500/20"
              : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
          }`}
        >
          {isDownloading ? (
            <>
              <Loader2 size={14} className="mr-1.5 animate-spin" /> Downloading...
            </>
          ) : accessType === "premium" ? (
            isPurchased ? (
              <>
                <Download size={14} className="mr-1.5" /> Download Master Package
              </>
            ) : (
              <>
                <CreditCard size={13} className="mr-1.5" /> Buy &amp; Download ₹{track.price || 99}
              </>
            )
          ) : accessType === "social" ? (
            isUnlocked ? (
              <>
                <Download size={14} className="mr-1.5" /> Download Unlocked Track
              </>
            ) : (
              <>
                <Lock size={13} className="mr-1.5" /> Unlock to Download
              </>
            )
          ) : (
            <>
              <Download size={14} className="mr-1.5" /> Free Download
            </>
          )}
        </Button>
        <p className="mt-1 text-center text-[10px] text-muted-foreground line-clamp-1">
          {accessType === "premium"
            ? isPurchased
              ? "✓ Payment verified · Direct download ready"
              : "Online Payment (UPI, Cards, GPay)"
            : accessType === "social"
            ? isUnlocked
              ? "✓ Unlocked · Download ready"
              : "Click to follow & unlock download"
            : "1-Click direct download with zero lock"}
        </p>
      </div>
    </article>
  );
}

export function MusicShopClient() {
  const [headerConfig, setHeaderConfig] = useStored<MusicHeaderData>(
    "admin-kryso-music-header",
    defaultMusicHeaderData
  );
  const [trackList, setTrackList] = useStored<MusicTrack[]>(
    "admin-music-tracks-v1",
    defaultMusicTracks
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<"all" | "premium" | "social" | "free">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic Music Videos State
  const [videos, setVideos] = useStored<MusicVideoItem[]>("admin-music-videos", defaultMusicVideos);
  const [activeVideo, setActiveVideo] = useState<MusicVideoItem | null>(null);

  // Sync music_videos from MongoDB on mount
  useEffect(() => {
    fetch("/api/collections?name=music_videos")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.items) && data.items.length > 0) {
          setVideos(data.items as MusicVideoItem[]);
        }
      })
      .catch(() => {});
  }, [setVideos]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingTrack, setPlayingTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const togglePlayTrack = (track: MusicTrack) => {
    const audioTarget = (track.audioUrl && track.audioUrl.trim()) || (track.downloadUrl && track.downloadUrl.trim());
    if (!audioTarget) {
      alert("No audio stream preview URL configured for this track yet.");
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (playingTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch((err) => {
          console.warn("Audio play prevented:", err);
        });
      }
      return;
    }

    // Switch to new track
    setPlayingTrack(track);
    setIsLoadingAudio(true);
    const resolvedUrl = formatAudioUrl(track.audioUrl || track.downloadUrl);
    audio.src = resolvedUrl;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoadingAudio(false);
      })
      .catch((err) => {
        console.warn("Audio play error:", err);
        setIsLoadingAudio(false);
      });
  };

  const handleSeek = (timeInSeconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVol;
      audio.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      const next = !audio.muted;
      audio.muted = next;
      setIsMuted(next);
    }
  };

  // Download state
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);

  // Social follow-to-unlock modal state
  const [lockModalTrack, setLockModalTrack] = useState<MusicTrack | null>(null);
  const [unlockedTrackIds, setUnlockedTrackIds] = useState<string[]>([]);
  const [steps, setSteps] = useState({ sp: false, yt: false, ig: false, fb: false });

  // Premium Track Razorpay Payment State
  const [purchasedTrackIds, setPurchasedTrackIds] = useState<string[]>([]);
  const [payingTrack, setPayingTrack] = useState<MusicTrack | null>(null);
  const [buyerData, setBuyerData] = useState({ name: "", email: "", phone: "" });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState("Connecting to Secure Payment Gateway...");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  // Load purchased tracks from localStorage
  useEffect(() => {
    try {
      const storedPurchases = localStorage.getItem("kryso_purchased_tracks");
      if (storedPurchases) {
        const parsed = JSON.parse(storedPurchases);
        if (Array.isArray(parsed)) setPurchasedTrackIds(parsed);
      }
    } catch {}
  }, []);

  // Listen for direct URL params (e.g. /music?type=premium or /music?type=free) and custom events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const applyFilterFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const type = (params.get("type") || params.get("filter") || "").toLowerCase();
        const hash = window.location.hash.toLowerCase();

        if (type === "premium" || hash.includes("premium")) {
          setSelectedSectionFilter("premium");
          setTimeout(() => {
            const el = document.getElementById("section-premium-tracks");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 300);
        } else if (type === "free" || type === "social" || hash.includes("free") || hash.includes("social")) {
          setSelectedSectionFilter("free");
          setTimeout(() => {
            const el = document.getElementById("section-social-tracks") || document.getElementById("section-free-tracks");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 300);
        }
      };

      applyFilterFromUrl();
      window.addEventListener("popstate", applyFilterFromUrl);

      const handleFilterEvent = (e: Event) => {
        const custom = e as CustomEvent<{ type?: "premium" | "free" }>;
        if (custom?.detail?.type) {
          setSelectedSectionFilter(custom.detail.type);
          setCurrentPage(1);
          setTimeout(() => {
            const targetId = custom.detail.type === "premium" ? "section-premium-tracks" : "section-social-tracks";
            const el = document.getElementById(targetId) || document.getElementById("section-free-tracks");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      };
      window.addEventListener("kryso:music-filter", handleFilterEvent);

      return () => {
        window.removeEventListener("popstate", applyFilterFromUrl);
        window.removeEventListener("kryso:music-filter", handleFilterEvent);
      };
    }
  }, []);

  // Clear any previously persisted social unlocks so locked tracks require unlocking on every page refresh
  useEffect(() => {
    try {
      localStorage.removeItem("kryso_unlocked_tracks");
    } catch {}
  }, []);

  // Fetch dynamic music header from MongoDB (and fallback to localStorage)
  useEffect(() => {
    fetch("/api/collections?name=music_header")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setHeaderConfig(data.items[0]);
        }
      })
      .catch(() => {});
  }, [setHeaderConfig]);

  // Fetch dynamic music tracks from MongoDB & auto-merge with local tracks
  useEffect(() => {
    fetch(`/api/collections?name=music_tracks&_t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          const remoteTracks = data.items as MusicTrack[];

          setTrackList((currentTracks) => {
            const list = Array.isArray(currentTracks) ? currentTracks : [];
            const remoteMap = new Map(remoteTracks.map((t) => [t.id, t]));
            // Keep all local tracks (even if not yet in DB) and merge with remote
            const mergedLocal = list.map((loc) => remoteMap.get(loc.id) || loc);
            const localIds = new Set(list.map((t) => t.id));
            const remoteOnly = remoteTracks.filter((t) => !localIds.has(t.id));
            const combined = [...mergedLocal, ...remoteOnly];
            const finalList = combined.length > 0 ? combined : defaultMusicTracks;

            return [...finalList].sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            });
          });

          // Sync any locally created track that isn't on the server yet
          let localStored: MusicTrack[] = [];
          try {
            const raw =
              localStorage.getItem("kryso:admin-music-tracks-v1") ||
              localStorage.getItem("admin-music-tracks-v1");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) localStored = parsed;
            }
          } catch {}

          const remoteIds = new Set(remoteTracks.map((t) => t.id));
          const unsynced = localStored.filter((t) => !remoteIds.has(t.id));
          for (const unsyncedTrack of unsynced) {
            fetch("/api/collections", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "music_tracks", item: unsyncedTrack }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [setTrackList]);

  // Extract unique genres from available tracks
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    trackList.forEach((t) => {
      if (t.genre && t.genre.trim()) {
        set.add(t.genre.trim());
      }
    });
    return ["All", ...Array.from(set)];
  }, [trackList]);

  // Handle Search execution
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveQuery(searchQuery.trim());
    setCurrentPage(1);
  };

  // Reset all filters and search
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveQuery("");
    setSelectedGenre("All");
    setSelectedSectionFilter("all");
    setCurrentPage(1);
  };

  // Filtered tracks based on search, genre, and section
  const filteredTracks = useMemo(() => {
    return trackList.filter((track) => {
      if (!track) return false;
      const queryLower = (activeQuery || "").toLowerCase();
      const trackName = (track.name || (track as unknown as { title?: string }).title || "").toString().toLowerCase();
      const trackSinger = (track.singer || (track as unknown as { artist?: string }).artist || "").toString().toLowerCase();
      const trackGenre = (track.genre || "").toString().toLowerCase();

      const matchesSearch =
        !queryLower ||
        trackName.includes(queryLower) ||
        trackSinger.includes(queryLower) ||
        trackGenre.includes(queryLower);

      const matchesGenre = selectedGenre === "All" || (track.genre && track.genre.trim() === selectedGenre);

      const access = getTrackAccessType(track);
      let matchesSection = true;
      if (selectedSectionFilter === "premium") {
        matchesSection = access === "premium";
      } else if (selectedSectionFilter === "free") {
        matchesSection = access === "free" || access === "social";
      } else if (selectedSectionFilter === "social") {
        matchesSection = access === "social";
      }

      return matchesSearch && matchesGenre && matchesSection;
    });
  }, [trackList, activeQuery, selectedGenre, selectedSectionFilter]);

  // Three Section Groups
  const premiumTracks = useMemo(() => {
    return filteredTracks.filter((t) => getTrackAccessType(t) === "premium");
  }, [filteredTracks]);

  const socialTracks = useMemo(() => {
    return filteredTracks.filter((t) => getTrackAccessType(t) === "social");
  }, [filteredTracks]);

  const freeTracks = useMemo(() => {
    return filteredTracks.filter((t) => getTrackAccessType(t) === "free");
  }, [filteredTracks]);

  // Overall counts for filter tabs
  const totalPremiumCount = useMemo(() => {
    return trackList.filter((t) => getTrackAccessType(t) === "premium").length;
  }, [trackList]);

  const totalSocialCount = useMemo(() => {
    return trackList.filter((t) => getTrackAccessType(t) === "social").length;
  }, [trackList]);

  const totalFreeCount = useMemo(() => {
    return trackList.filter((t) => getTrackAccessType(t) === "free").length;
  }, [trackList]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTracks.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedTracks = useMemo(() => {
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredTracks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTracks, validPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const section = document.getElementById("tracks-catalog-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Helper to load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Primary Action handler based on track type
  const handleTrackAction = (track: MusicTrack) => {
    const access = getTrackAccessType(track);

    if (access === "free") {
      // Free: 1-click direct download
      triggerDownload(track);
      return;
    }

    if (access === "social") {
      // Social: If followed/unlocked, download; else open social follow modal
      const isUnlocked = unlockedTrackIds.includes(track.id);
      if (isUnlocked) {
        triggerDownload(track);
      } else {
        setLockModalTrack(track);
        setSteps({ sp: false, yt: false, ig: false, fb: false });
      }
      return;
    }

    if (access === "premium") {
      // Premium: If already purchased in this session/browser, direct download; else open Razorpay checkout
      const isPurchased = purchasedTrackIds.includes(track.id);
      if (isPurchased) {
        triggerDownload(track);
      } else {
        setPayingTrack(track);
        setPaymentError(null);
        setPaymentLoading(false);
      }
      return;
    }
  };

  // Initiate Razorpay payment for Premium track
  const startTrackPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingTrack) return;
    if (!buyerData.name.trim() || !buyerData.email.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);
    setPaymentStatusText("Connecting to Secure Payment Gateway...");

    const trackPrice = payingTrack.price && Number(payingTrack.price) > 0 ? Number(payingTrack.price) : 99;

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: trackPrice,
          currency: "INR",
          receipt: `track_${payingTrack.id.slice(-8)}_${Date.now()}`.slice(0, 40),
          studentName: buyerData.name,
          courseName: `Song Master: ${payingTrack.name}`,
          notes: {
            trackId: payingTrack.id,
            trackName: payingTrack.name,
            singer: payingTrack.singer,
            buyerEmail: buyerData.email,
            buyerPhone: buyerData.phone,
          },
        }),
      });

      const orderData = await orderRes.json();
      const effectiveKey = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TQQ6MP7755xsA2";
      const orderId = orderData.orderId;

      setPaymentStatusText("Launching secure payment checkout...");
      const isLoaded = await loadRazorpayScript();

      interface RazorpayPaymentResponse {
        razorpay_payment_id?: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
      }

      interface CustomRazorpayInstance {
        open: () => void;
        on: (event: string, callback: (res: { error?: { description?: string } }) => void) => void;
      }

      type RazorpayConstructor = new (options: Record<string, unknown>) => CustomRazorpayInstance;

      const RazorpayClass = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;

      if (isLoaded && typeof RazorpayClass === "function") {
        const amountInPaise = Math.round(trackPrice * 100);

        const rzp = new RazorpayClass({
          key: effectiveKey,
          amount: amountInPaise,
          currency: "INR",
          name: "KRYSO Music",
          description: `Master Track: ${payingTrack.name}`,
          image: formatImageUrl(payingTrack.imageUrl || "/kryso-logo.png"),
          order_id: orderId || undefined,
          prefill: {
            name: buyerData.name,
            email: buyerData.email,
            contact: buyerData.phone,
          },
          notes: {
            trackId: payingTrack.id,
            trackName: payingTrack.name,
          },
          theme: {
            color: "#f59e0b",
          },
          handler: function (response: RazorpayPaymentResponse) {
            const current = payingTrack;
            const nextPurchased = [...purchasedTrackIds, current.id];
            setPurchasedTrackIds(nextPurchased);
            try {
              localStorage.setItem("kryso_purchased_tracks", JSON.stringify(nextPurchased));
            } catch {}

            setPayingTrack(null);
            setPaymentLoading(false);
            setPaymentSuccessToast(`Payment successful (${response.razorpay_payment_id || "PAID"})! Downloading "${current.name}"...`);
            setTimeout(() => setPaymentSuccessToast(null), 6000);

            // Trigger download automatically
            triggerDownload(current);
          },
          modal: {
            ondismiss: function () {
              setPaymentLoading(false);
            },
          },
        });

        rzp.on("payment.failed", (response) => {
          setPaymentError(response.error?.description || "Payment was not completed. Please try again.");
          setPaymentLoading(false);
        });

        rzp.open();
      } else {
        setPaymentError("Could not load payment gateway. Please check your internet connection.");
        setPaymentLoading(false);
      }
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setPaymentError((err as Error).message || "Unable to initiate payment.");
      setPaymentLoading(false);
    }
  };

  const triggerDownload = async (track: MusicTrack) => {
    const downloadTarget = (track.downloadUrl && track.downloadUrl.trim()) || (track.audioUrl && track.audioUrl.trim());

    if (!downloadTarget) {
      alert("No audio/ZIP download link configured for this release yet.");
      return;
    }

    setDownloadingTrackId(track.id);

    const cleanTrackName = (track.name || "Track").trim().replace(/[/\\?%*:|"<>]/g, "_");
    const cleanSingerName = (track.singer || "Kryso").trim().replace(/[/\\?%*:|"<>]/g, "_");

    try {
      const lower = downloadTarget.toLowerCase();
      const isZip = lower.includes(".zip") || (track.downloadUrl && !track.downloadUrl.match(/\.(mp3|mp4|wav|m4a)$/i));
      const isMp4 = lower.includes(".mp4");
      const isWav = lower.includes(".wav");
      const isM4a = lower.includes(".m4a");
      const ext = isZip ? ".zip" : isMp4 ? ".mp4" : isWav ? ".wav" : isM4a ? ".m4a" : ".mp3";
      const filename = `${cleanTrackName} - ${cleanSingerName}${ext}`;

      const downloadEndpoint = `/api/download?url=${encodeURIComponent(downloadTarget)}&filename=${encodeURIComponent(filename)}`;

      const link = document.createElement("a");
      link.href = downloadEndpoint;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        setDownloadingTrackId(null);
      }, 1500);
    } catch (err) {
      console.error("Track download error:", err);
      window.open(downloadTarget, "_blank");
      setDownloadingTrackId(null);
    }
  };

  const markStepDone = (key: "sp" | "yt" | "ig" | "fb", url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setSteps((prev) => ({ ...prev, [key]: true }));
  };

  const completeUnlock = () => {
    if (!lockModalTrack) return;
    const currentTrack = lockModalTrack;
    // Unlock in temporary component state only for this view session
    const nextList = [...unlockedTrackIds, currentTrack.id];
    setUnlockedTrackIds(nextList);

    setLockModalTrack(null);
    triggerDownload(currentTrack);
  };

  const allStepsDone = steps.sp && steps.yt && steps.ig && steps.fb;

  return (
    <SiteShell>
      {/* Hero Banner with Fixed Aspect/Height & Dynamic Cropped Artwork */}
      <section className="relative isolate overflow-hidden bg-background text-foreground border-b border-border min-h-[300px] sm:min-h-[340px] flex items-center">
        {/* Dynamic Cropped & Positioned Background Artwork */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={formatImageUrl(headerConfig?.bgImageUrl || "/music-hero.jpg")}
            alt="KRYSO Music Studio & Live Stage"
            style={{
              objectPosition: `${headerConfig?.positionX ?? 75}% ${headerConfig?.positionY ?? 50}%`,
              transform: `scale(${(headerConfig?.zoom ?? 100) / 100})`,
              transformOrigin: `${headerConfig?.positionX ?? 75}% ${headerConfig?.positionY ?? 50}%`,
              filter: `brightness(${headerConfig?.brightness ?? 100}%) contrast(${headerConfig?.contrast ?? 110}%)`,
              opacity: (headerConfig?.opacity ?? 65) / 100,
            }}
            className="size-full object-cover transition-all duration-300"
            onError={(e) => {
              e.currentTarget.src = "/music-hero.jpg";
            }}
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/85 to-background/25 sm:via-background/70 sm:to-transparent" />
        <div className="page-shell py-10 sm:py-14 w-full">
          <p className="eyebrow flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" /> {headerConfig?.badge || defaultMusicHeaderData.badge}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold sm:text-5xl text-foreground">
            {headerConfig?.title || defaultMusicHeaderData.title}{" "}
            <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]">
              {headerConfig?.titleHighlight || defaultMusicHeaderData.titleHighlight}
            </span>
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            {headerConfig?.description || defaultMusicHeaderData.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2 text-foreground font-semibold">
              <Headphones size={15} className="text-amber-400" /> {headerConfig?.badge1 || defaultMusicHeaderData.badge1}
            </span>
            <span>·</span>
            <span>{headerConfig?.badge2 || defaultMusicHeaderData.badge2}</span>
            <span>·</span>
            <span>{headerConfig?.badge3 || defaultMusicHeaderData.badge3}</span>
          </div>
        </div>
      </section>

      {/* Main Music Tracks Catalog Section */}
      <section
        id="tracks-catalog-section"
        className={`page-shell py-8 sm:py-12 scroll-mt-24 transition-all duration-300 ${
          playingTrack ? "pb-28 sm:pb-36" : ""
        }`}
      >
        {/* Section Heading & Search Form */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-border">
          <SectionHeading
            label={headerConfig?.catalogLabel || defaultMusicHeaderData.catalogLabel || "Original Sound Catalog"}
            title={headerConfig?.catalogTitle || defaultMusicHeaderData.catalogTitle || "Music Tracks"}
            text={headerConfig?.catalogDescription || defaultMusicHeaderData.catalogDescription || "Explore the full discography and download high-definition studio master packages."}
          />

          {/* Search Input with Dedicated Search Button */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <span className="sr-only">Search music tracks</span>
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by track, singer, genre..."
                className="h-11 rounded-full pl-10 pr-9 bg-card border-border text-foreground focus-visible:ring-amber-500 text-sm shadow-sm w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="h-11 rounded-full px-6 font-extrabold shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-black shrink-0 text-xs sm:text-sm cursor-pointer"
            >
              <Search size={15} className="mr-1.5" /> Search
            </Button>
          </form>
        </div>


        {/* Payment Success Toast */}
        {paymentSuccessToast && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-500/15 border border-emerald-500/40 p-4 text-emerald-300 animate-in fade-in-50 duration-300 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Check size={18} />
              </span>
              <div>
                <p className="font-bold text-sm text-foreground">Payment Successful!</p>
                <p className="text-xs text-emerald-300/90">{paymentSuccessToast}</p>
              </div>
            </div>
            <button
              onClick={() => setPaymentSuccessToast(null)}
              className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          {/* Section & Genre Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mr-1">
              <SlidersHorizontal size={14} /> Sections:
            </span>

            {/* 2 Main Song Type Categories: Premium & Free (includes Social Unlock) */}
            <div className="flex flex-wrap rounded-lg bg-secondary p-1 border border-border gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedSectionFilter("all");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedSectionFilter === "all"
                    ? "bg-amber-500 text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Releases ({trackList.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSectionFilter("premium");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedSectionFilter === "premium"
                    ? "bg-amber-500 text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                💎 Premium ({totalPremiumCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSectionFilter("free");
                  setCurrentPage(1);
                }}
                className={`rounded-md px-3 py-1 text-xs font-extrabold transition-all cursor-pointer ${
                  selectedSectionFilter === "free"
                    ? "bg-emerald-500 text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ⚡ Free ({totalFreeCount + totalSocialCount})
              </button>
            </div>

            {/* Genre Filter Pills */}
            {availableGenres.length > 2 && (
              <div className="flex flex-wrap gap-1.5 ml-2">
                {availableGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => {
                      setSelectedGenre(genre);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all border cursor-pointer ${
                      selectedGenre === genre
                        ? "border-amber-500 bg-amber-500 text-black shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-amber-500/50 hover:text-foreground"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Filter Indicators & Reset Button */}
          {(activeQuery || selectedGenre !== "All" || selectedSectionFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-amber-400 gap-1.5"
            >
              <RotateCcw size={13} /> Reset filters
            </Button>
          )}
        </div>

        {/* 3 Dedicated Sections Container */}
        {filteredTracks.length > 0 ? (
          <div className="mt-10 space-y-14">
            {/* ---------------------------------------------------- */}
            {/* SECTION 1: 💎 PREMIUM TRACKS (RAZORPAY)               */}
            {/* ---------------------------------------------------- */}
            {(selectedSectionFilter === "all" || selectedSectionFilter === "premium") && (
              <div id="section-premium-tracks" className="scroll-mt-28">
                {/* Section Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                      <CreditCard size={20} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                          Premium Releases
                        </h2>
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-400">
                          Instant Master Packages
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        High-definition 24-bit uncompressed studio master packages. Instant secure checkout (UPI, Cards, NetBanking).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
                    {premiumTracks.length} {premiumTracks.length === 1 ? "track" : "tracks"}
                  </span>
                </div>

                {/* Section Grid */}
                {premiumTracks.length > 0 ? (
                  <div className="mt-6 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {premiumTracks.map((track) => (
                      <TrackItemCard
                        key={track.id}
                        track={track}
                        accessType="premium"
                        isPurchased={purchasedTrackIds.includes(track.id)}
                        isUnlocked={true}
                        isDownloading={downloadingTrackId === track.id}
                        isCurrentAudio={playingTrack?.id === track.id}
                        isPlayingThisTrack={isPlaying && playingTrack?.id === track.id}
                        isLoadingAudio={isLoadingAudio && playingTrack?.id === track.id}
                        currentTime={currentTime}
                        duration={duration}
                        onTogglePlay={() => togglePlayTrack(track)}
                        onAction={() => handleTrackAction(track)}
                        onSeek={handleSeek}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-border py-8 text-center bg-card/40">
                    <p className="text-xs text-muted-foreground">No premium tracks match your current filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SECTION 2: 📱 SOCIAL EXCLUSIVE TRACKS (FOLLOW LOCK)   */}
            {/* ---------------------------------------------------- */}
            {(selectedSectionFilter === "all" || selectedSectionFilter === "social" || selectedSectionFilter === "free") && (
              <div id="section-social-tracks" className="scroll-mt-28">
                {/* Section Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shrink-0">
                      <Lock size={20} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                          Free Master Releases
                        </h2>
                        <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-400">
                          Unlock to Download
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Unlock and download high-definition studio master packages for free.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 self-start sm:self-auto">
                    {socialTracks.length} {socialTracks.length === 1 ? "track" : "tracks"}
                  </span>
                </div>

                {/* Section Grid */}
                {socialTracks.length > 0 ? (
                  <div className="mt-6 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {socialTracks.map((track) => (
                      <TrackItemCard
                        key={track.id}
                        track={track}
                        accessType="social"
                        isPurchased={false}
                        isUnlocked={unlockedTrackIds.includes(track.id)}
                        isDownloading={downloadingTrackId === track.id}
                        isCurrentAudio={playingTrack?.id === track.id}
                        isPlayingThisTrack={isPlaying && playingTrack?.id === track.id}
                        isLoadingAudio={isLoadingAudio && playingTrack?.id === track.id}
                        currentTime={currentTime}
                        duration={duration}
                        onTogglePlay={() => togglePlayTrack(track)}
                        onAction={() => handleTrackAction(track)}
                        onSeek={handleSeek}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-border py-8 text-center bg-card/40">
                    <p className="text-xs text-muted-foreground">No tracks match your current filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* SECTION 3: ⚡ FREE DISCOGRAPHY (DIRECT DOWNLOAD)      */}
            {/* ---------------------------------------------------- */}
            {(selectedSectionFilter === "all" || selectedSectionFilter === "free") && (
              <div id="section-free-tracks" className="scroll-mt-28">
                {/* Section Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                      <Unlock size={20} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground">
                          Free Discography &amp; Edits
                        </h2>
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400">
                          100% Free · 1-Click Direct
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Direct 1-click downloads with zero lock, no social follow, and no payment required. Pure music for fans.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                    {freeTracks.length} {freeTracks.length === 1 ? "track" : "tracks"}
                  </span>
                </div>

                {/* Section Grid */}
                {freeTracks.length > 0 ? (
                  <div className="mt-6 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {freeTracks.map((track) => (
                      <TrackItemCard
                        key={track.id}
                        track={track}
                        accessType="free"
                        isPurchased={false}
                        isUnlocked={true}
                        isDownloading={downloadingTrackId === track.id}
                        isCurrentAudio={playingTrack?.id === track.id}
                        isPlayingThisTrack={isPlaying && playingTrack?.id === track.id}
                        isLoadingAudio={isLoadingAudio && playingTrack?.id === track.id}
                        currentTime={currentTime}
                        duration={duration}
                        onTogglePlay={() => togglePlayTrack(track)}
                        onAction={() => handleTrackAction(track)}
                        onSeek={handleSeek}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-border py-8 text-center bg-card/40">
                    <p className="text-xs text-muted-foreground">No free tracks match your current filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty Search / Filter Results State */
          <div className="mt-10 rounded-2xl border border-dashed border-border py-20 text-center bg-card/30">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary border border-border mb-3">
              <Music size={22} />
            </span>
            <p className="font-display text-xl font-bold text-foreground">
              {activeQuery || selectedGenre !== "All" || selectedSectionFilter !== "all"
                ? "No music tracks matched your filters"
                : "No music tracks published yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {activeQuery || selectedGenre !== "All" || selectedSectionFilter !== "all"
                ? "Try adjusting your search terms or clearing your selected filters."
                : "New releases will appear here as soon as they are added in the Admin panel."}
            </p>
            {(activeQuery || selectedGenre !== "All" || selectedSectionFilter !== "all") && (
              <Button
                onClick={handleResetFilters}
                className="mt-5 rounded-full font-bold shadow-md shadow-primary/20"
              >
                <RotateCcw size={15} className="mr-1.5" /> Reset all filters
              </Button>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* Pagination Controls                                  */}
        {/* ---------------------------------------------------- */}
        {filteredTracks.length > ITEMS_PER_PAGE && (
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <strong className="text-foreground">
                {(validPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(validPage * ITEMS_PER_PAGE, filteredTracks.length)}
              </strong>{" "}
              of <strong className="text-foreground">{filteredTracks.length}</strong> tracks
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {/* Previous Page Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={validPage <= 1}
                onClick={() => handlePageChange(validPage - 1)}
                className="h-9 rounded-full px-3 text-xs font-semibold border-border hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft size={15} className="mr-1" /> Prev
              </Button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`size-8 sm:size-9 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                    validPage === pageNum
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-card border border-border text-muted-foreground hover:border-amber-500/50 hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Page Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={validPage >= totalPages}
                onClick={() => handlePageChange(validPage + 1)}
                className="h-9 rounded-full px-3 text-xs font-semibold border-border hover:bg-secondary disabled:opacity-40"
              >
                Next <ChevronRight size={15} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* OFFICIAL MUSIC VIDEOS & LIVE VISUALS SECTION         */}
      {/* ---------------------------------------------------- */}
      {videos.length > 0 && (
        <section
          className={`page-shell pt-10 border-t border-border/80 transition-all duration-300 ${
            playingTrack ? "pb-32 sm:pb-40" : "pb-16 sm:pb-24"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-widest">
                <Film size={12} /> {headerConfig?.videosBadge || defaultMusicHeaderData.videosBadge || "Official Visuals & Stage Footage"}
              </span>
              <h2 className="mt-2.5 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                {headerConfig?.videosTitle ? (
                  headerConfig.videosTitle.includes("&") ? (
                    <>
                      {headerConfig.videosTitle.split("&")[0]}&{" "}
                      <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                        {headerConfig.videosTitle.split("&")[1]?.trim()}
                      </span>
                    </>
                  ) : (
                    headerConfig.videosTitle
                  )
                ) : (
                  <>
                    Music Videos &amp; <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]">Live Sets</span>
                  </>
                )}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
                {headerConfig?.videosDescription || defaultMusicHeaderData.videosDescription || "Stream official music releases, festival aftermovies, and exclusive live concert sets from KRYSO. Click any video to watch."}
              </p>
            </div>
          </div>

          {/* Video Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {videos.map((vid) => {
              const thumb = getVideoThumbnail(vid);
              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className="group relative rounded-2xl sm:rounded-3xl border border-border bg-card overflow-hidden cursor-pointer shadow-xl hover:border-amber-500/60 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* 16:9 Thumbnail Canvas */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/80">
                    <img
                      src={thumb}
                      alt={vid.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20" />

                    {/* Pulsing Glowing Play Button Overlay */}
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="relative size-14 sm:size-16 rounded-full bg-amber-500/95 text-black grid place-items-center shadow-xl shadow-amber-500/40 group-hover:scale-115 transition-all duration-300 group-hover:bg-amber-400">
                        <span className="absolute -inset-1 rounded-full bg-amber-500/40 animate-ping pointer-events-none" />
                        <Play size={22} className="fill-current ml-0.5 text-black" />
                      </div>
                    </div>

                    {/* Category Pill Top Left */}
                    {vid.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-black border border-white/10 uppercase tracking-wider">
                        {vid.category}
                      </span>
                    )}

                    {/* Duration Pill Bottom Right */}
                    {vid.duration && (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                        {vid.duration}
                      </span>
                    )}
                  </div>

                  {/* Video Info Bottom */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground group-hover:text-amber-400 transition-colors line-clamp-1">
                      {vid.title}
                    </h3>
                    {vid.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    )}
                    <div className="mt-3.5 flex items-center justify-between text-xs font-semibold text-amber-400 pt-3 border-t border-border/60">
                      <span className="inline-flex items-center gap-1 group-hover:underline">
                        Watch Video <Play size={11} className="fill-current" />
                      </span>
                      <span className="text-[11px] text-muted-foreground font-normal">KRYSO Official</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- */}
      {/* Social Follow-to-Unlock Modal                        */}
      {/* ---------------------------------------------------- */}
      {lockModalTrack && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl text-card-foreground">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Lock size={17} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Unlock Free Download</h3>
                  <p className="text-xs text-muted-foreground">Follow on Spotify, YouTube, Instagram & FB to unlock</p>
                </div>
              </div>
              <button
                onClick={() => setLockModalTrack(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Track Info Preview Box */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 p-3">
              <div className="flex items-center gap-3 min-w-0">
                {lockModalTrack.imageUrl ? (
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border">
                    <Image
                      src={formatImageUrl(lockModalTrack.imageUrl)}
                      alt={lockModalTrack.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Music size={22} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-foreground">{lockModalTrack.name}</p>
                  <p className="text-xs text-muted-foreground truncate">by {lockModalTrack.singer}</p>
                  <span className="inline-block text-[10px] font-bold text-primary mt-0.5">Studio Master MP4 / MP3</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePlayTrack(lockModalTrack)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {isLoadingAudio && playingTrack?.id === lockModalTrack.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : isPlaying && playingTrack?.id === lockModalTrack.id ? (
                  <>
                    <Pause size={13} className="fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-current ml-0.5" />
                    <span>Preview</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Steps List */}
            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Required steps ({Object.values(steps).filter(Boolean).length}/4):
              </p>

              {/* Step 1: Spotify */}
              <button
                type="button"
                onClick={() => markStepDone("sp", lockModalTrack.spotifyUrl || siteSettings.spotifyUrl)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  steps.sp
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-emerald-500/40 bg-emerald-500/5 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-[#1DB954] text-black shadow-sm">
                    <SpotifyIcon size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Follow on Spotify</p>
                    <p className="text-[11px] text-muted-foreground">Stream & follow KRYSO on Spotify</p>
                  </div>
                </div>
                {steps.sp ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={14} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    Follow <ExternalLink size={12} />
                  </span>
                )}
              </button>

              {/* Step 2: YouTube */}
              <button
                type="button"
                onClick={() => markStepDone("yt", lockModalTrack.youtubeUrl || siteSettings.youtubeUrl)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  steps.yt
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/40 bg-red-500/5 text-foreground hover:bg-red-500/10 hover:border-red-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-red-600 text-white shadow-sm">
                    <Youtube size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Subscribe on YouTube</p>
                    <p className="text-[11px] text-muted-foreground">Join our official channel</p>
                  </div>
                </div>
                {steps.yt ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={14} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
                    Subscribe <ExternalLink size={12} />
                  </span>
                )}
              </button>

              {/* Step 3: Instagram */}
              <button
                type="button"
                onClick={() => markStepDone("ig", lockModalTrack.instagramUrl || siteSettings.instagramUrl)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  steps.ig
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-pink-500/40 bg-pink-500/5 text-foreground hover:bg-pink-500/10 hover:border-pink-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white shadow-sm">
                    <Instagram size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Follow on Instagram</p>
                    <p className="text-[11px] text-muted-foreground">@_krysomusic</p>
                  </div>
                </div>
                {steps.ig ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={14} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-pink-400">
                    Follow <ExternalLink size={12} />
                  </span>
                )}
              </button>

              {/* Step 4: Facebook */}
              <button
                type="button"
                onClick={() => markStepDone("fb", lockModalTrack.facebookUrl || siteSettings.facebookUrl)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  steps.fb
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-blue-500/40 bg-blue-500/5 text-foreground hover:bg-blue-500/10 hover:border-blue-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-blue-600 text-white shadow-sm">
                    <Facebook size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Follow on Facebook</p>
                    <p className="text-[11px] text-muted-foreground">Kryso Official Page</p>
                  </div>
                </div>
                {steps.fb ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Check size={14} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-400">
                    Follow <ExternalLink size={12} />
                  </span>
                )}
              </button>
            </div>

            {/* Unlock & Download Action */}
            <div className="mt-6 border-t border-border pt-4">
              {allStepsDone ? (
                <Button
                  onClick={completeUnlock}
                  disabled={downloadingTrackId === lockModalTrack.id}
                  className="w-full h-12 rounded-full font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 animate-pulse text-sm"
                >
                  {downloadingTrackId === lockModalTrack.id ? (
                    <>
                      <Loader2 size={17} className="mr-2 animate-spin" /> Starting Download...
                    </>
                  ) : (
                    <>
                      <Download size={17} className="mr-2" /> Download Unlocked Track Now!
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={completeUnlock}
                  disabled={downloadingTrackId === lockModalTrack.id}
                  variant="outline"
                  className="w-full h-11 rounded-full text-xs font-semibold border-border hover:bg-secondary text-muted-foreground"
                >
                  {downloadingTrackId === lockModalTrack.id ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" /> Starting Download...
                    </>
                  ) : (
                    "I have subscribed — Unlock and download"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Razorpay Checkout Modal for Premium Tracks           */}
      {/* ---------------------------------------------------- */}
      {payingTrack && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-amber-500/40 bg-card p-5 sm:p-6 shadow-2xl text-card-foreground relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <CreditCard size={20} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Premium Track Checkout</h3>
                  <p className="text-xs text-muted-foreground">Secure Payment Gateway (UPI, Cards, GPay)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!paymentLoading) setPayingTrack(null);
                }}
                disabled={paymentLoading}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Track Info Box */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/50 p-3.5">
              <div className="flex items-center gap-3.5 min-w-0">
                {payingTrack.imageUrl ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border">
                    <Image
                      src={formatImageUrl(payingTrack.imageUrl)}
                      alt={payingTrack.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                    <Music size={26} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-foreground text-sm">{payingTrack.name}</p>
                  <p className="text-xs text-muted-foreground truncate">Singer / Artist: {payingTrack.singer}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400">Master ZIP Delivery</span>
                    <span className="text-xs font-extrabold text-amber-400">₹{payingTrack.price || 99} INR</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePlayTrack(payingTrack)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {isLoadingAudio && playingTrack?.id === payingTrack.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : isPlaying && playingTrack?.id === payingTrack.id ? (
                  <>
                    <Pause size={13} className="fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-current ml-0.5" />
                    <span>Preview</span>
                  </>
                )}
              </button>
            </div>

            {/* Buyer Contact Form */}
            <form onSubmit={startTrackPayment} className="mt-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-foreground">Your Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={buyerData.name}
                  onChange={(e) => setBuyerData({ ...buyerData, name: e.target.value })}
                  disabled={paymentLoading}
                  className="mt-1 bg-background border-border text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Email Address (for download delivery) *</label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={buyerData.email}
                  onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                  disabled={paymentLoading}
                  className="mt-1 bg-background border-border text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Mobile / WhatsApp Number</label>
                <Input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={buyerData.phone}
                  onChange={(e) => setBuyerData({ ...buyerData, phone: e.target.value })}
                  disabled={paymentLoading}
                  className="mt-1 bg-background border-border text-xs rounded-xl"
                />
              </div>

              {paymentError && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  {paymentError}
                </div>
              )}

              {paymentLoading && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300">
                  <Loader2 size={16} className="animate-spin shrink-0 text-amber-400" />
                  <span>{paymentStatusText}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={paymentLoading}
                className="w-full h-12 rounded-full font-black text-sm bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 cursor-pointer"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} className="mr-2" /> Pay ₹{payingTrack.price || 99} Online
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>100% Secure Payment · Instant Automated Download</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Interactive Video Player Modal (Cinema Popup)        */}
      {/* ---------------------------------------------------- */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-lg p-3 sm:p-6 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0B0F17] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="size-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white truncate font-display">
                  {activeVideo.title}
                </span>
                {activeVideo.category && (
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold shrink-0">
                    {activeVideo.category}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition-colors cursor-pointer shrink-0"
                aria-label="Close video player"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Canvas Container 16:9 */}
            <div className="relative aspect-video w-full bg-black">
              {(() => {
                const parsed = parseVideoUrl(activeVideo.videoUrl);
                if (parsed.type === "youtube") {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={activeVideo.title}
                    />
                  );
                }
                return (
                  <video
                    src={activeVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Global Hidden Audio Engine Element                   */}
      {/* ---------------------------------------------------- */}
      <audio
        ref={audioRef}
        preload="none"
        controlsList="nodownload noplaybackrate"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
            setIsLoadingAudio(false);
          }
        }}
        onError={() => {
          setIsLoadingAudio(false);
          setIsPlaying(false);
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* Sticky Bottom "Now Playing" Dock                     */}
      {/* ---------------------------------------------------- */}
      {playingTrack && (
        <aside
          aria-label="Now Playing Audio Bar"
          className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 border-t border-amber-500/40 bg-card/95 backdrop-blur-xl shadow-2xl"
        >
          {/* Top Edge Progress Scrubber */}
          <div
            className="relative h-1.5 w-full bg-border/60 hover:h-2.5 transition-all cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              handleSeek(pct * (duration || 0));
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-75"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
            {/* Left: Artwork & Details */}
            <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs">
              <div className="relative size-11 sm:size-12 shrink-0 overflow-hidden rounded-xl border border-amber-500/40 bg-secondary shadow-md">
                {playingTrack.imageUrl ? (
                  <Image
                    src={formatImageUrl(playingTrack.imageUrl)}
                    alt={playingTrack.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    <Music size={20} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display font-bold text-xs sm:text-sm text-foreground">
                  {playingTrack.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {playingTrack.singer}
                </p>
                <div className="mt-0.5">
                  {getTrackAccessType(playingTrack) === "premium" && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Premium ₹{playingTrack.price || 99}
                    </span>
                  )}
                  {getTrackAccessType(playingTrack) === "social" && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      Social Release
                    </span>
                  )}
                  {getTrackAccessType(playingTrack) === "free" && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      100% Free
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Controls + Time Scrub */}
            <div className="flex flex-col items-center gap-1 flex-1 max-w-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Replay 10s */}
                <button
                  type="button"
                  onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw size={16} />
                </button>

                {/* Main Play/Pause Button */}
                <button
                  type="button"
                  onClick={() => togglePlayTrack(playingTrack)}
                  className="grid size-9 sm:size-10 place-items-center rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isLoadingAudio ? (
                    <Loader2 size={18} className="animate-spin text-black" />
                  ) : isPlaying ? (
                    <Pause size={18} className="fill-current" />
                  ) : (
                    <Play size={18} className="fill-current ml-0.5" />
                  )}
                </button>

                {/* Skip 10s */}
                <button
                  type="button"
                  onClick={() => handleSeek(Math.min(duration || 0, currentTime + 10))}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                  title="Skip forward 10 seconds"
                >
                  <RotateCw size={16} />
                </button>
              </div>

              {/* Time display & mini scrubber slider */}
              <div className="hidden sm:flex items-center gap-2 w-full text-[11px] font-mono text-muted-foreground">
                <span>{formatAudioTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer accent-amber-400 bg-secondary rounded-lg"
                />
                <span>{formatAudioTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume & Contextual Action CTA */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Volume button (desktop) */}
              <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="hover:text-foreground transition-colors p-1 cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-16 h-1 cursor-pointer accent-amber-400 bg-secondary rounded-lg"
                />
              </div>

              {/* Action Button inside Now Playing Bar */}
              <Button
                size="sm"
                onClick={() => handleTrackAction(playingTrack)}
                disabled={downloadingTrackId === playingTrack.id}
                className={`h-8 sm:h-9 px-3 sm:px-4 rounded-xl font-bold text-xs shadow-md cursor-pointer ${
                  getTrackAccessType(playingTrack) === "premium"
                    ? purchasedTrackIds.includes(playingTrack.id)
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                      : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
                    : getTrackAccessType(playingTrack) === "social"
                    ? unlockedTrackIds.includes(playingTrack.id)
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                      : "bg-sky-500 hover:bg-sky-400 text-black shadow-sky-500/20"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
                }`}
              >
                {downloadingTrackId === playingTrack.id ? (
                  <Loader2 size={13} className="animate-spin mr-1" />
                ) : (
                  <Download size={13} className="mr-1" />
                )}
                <span className="hidden xs:inline">
                  {getTrackAccessType(playingTrack) === "premium"
                    ? purchasedTrackIds.includes(playingTrack.id)
                      ? "Download Master"
                      : `Buy ₹${playingTrack.price || 99}`
                    : getTrackAccessType(playingTrack) === "social"
                    ? unlockedTrackIds.includes(playingTrack.id)
                      ? "Download Track"
                      : "Unlock"
                    : "Download Free"}
                </span>
              </Button>

              {/* Close / Dismiss Bar */}
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                  setPlayingTrack(null);
                }}
                className="size-7 sm:size-8 grid place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Stop & Close Player"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </aside>
      )}

    </SiteShell>
  );
}
