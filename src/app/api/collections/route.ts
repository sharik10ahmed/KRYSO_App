import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ObjectId, type Filter, type Document } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCache, setCache, invalidateCollectionsCache } from "@/lib/redis";
import {
  courses,
  defaultMusicTracks,
  defaultMusicVideos,
  defaultSpotlightSlides,
  teachers,
  defaultSyllabusModules,
  defaultStudioGearItems,
  testimonials,
  gallery,
  siteSettings,
  defaultMusicHeaderData,
  defaultKrysoPageImages,
  defaultKrysoPageConfig,
  defaultKrysoBiography,
  defaultKrysoShowsData,
  defaultKrysoDownloads,
  defaultKrysoProducerData,
  defaultKrysoTechriderData,
} from "@/data/catalog";
import { defaultAcademySpotlightImages } from "@/components/academy-spotlight";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const DEFAULT_COLLECTIONS: Record<string, Array<Record<string, unknown>>> = {
  academy_courses: courses as unknown as Array<Record<string, unknown>>,
  music_tracks: defaultMusicTracks as unknown as Array<Record<string, unknown>>,
  music_videos: defaultMusicVideos as unknown as Array<Record<string, unknown>>,
  academy_spotlight_images: defaultAcademySpotlightImages as unknown as Array<Record<string, unknown>>,
  spotlight_slides: defaultSpotlightSlides as unknown as Array<Record<string, unknown>>,
  academy_teachers: teachers as unknown as Array<Record<string, unknown>>,
  academy_curriculum: defaultSyllabusModules as unknown as Array<Record<string, unknown>>,
  academy_studio_gear: defaultStudioGearItems as unknown as Array<Record<string, unknown>>,
  academy_testimonials: testimonials as unknown as Array<Record<string, unknown>>,
  academy_gallery: gallery as unknown as Array<Record<string, unknown>>,
  site_settings: [siteSettings as unknown as Record<string, unknown>],
  music_header: [defaultMusicHeaderData as unknown as Record<string, unknown>],
  kryso_page_images: defaultKrysoPageImages as unknown as Array<Record<string, unknown>>,
  kryso_page_config: [defaultKrysoPageConfig as unknown as Record<string, unknown>],
  kryso_biography: [defaultKrysoBiography as unknown as Record<string, unknown>],
  kryso_shows: defaultKrysoShowsData as unknown as Array<Record<string, unknown>>,
  kryso_downloads: defaultKrysoDownloads as unknown as Array<Record<string, unknown>>,
  kryso_producer: [defaultKrysoProducerData as unknown as Record<string, unknown>],
  kryso_techrider: [defaultKrysoTechriderData as unknown as Record<string, unknown>],
};

const DATA_FALLBACK_FILE = path.join(process.cwd(), "src", "data", "collections-fallback.json");

function loadDiskFallback(): Record<string, Array<Record<string, unknown>>> {
  try {
    if (fs.existsSync(DATA_FALLBACK_FILE)) {
      const content = fs.readFileSync(DATA_FALLBACK_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Could not read collections-fallback.json:", e);
  }
  return {};
}

function saveDiskFallback(name: string, items: Array<Record<string, unknown>>) {
  try {
    const existing = loadDiskFallback();
    existing[name] = items;
    fs.writeFileSync(DATA_FALLBACK_FILE, JSON.stringify(existing, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not persist collections-fallback.json:", e);
  }
}

interface GlobalFallback {
  _krysoFallbackStore?: Record<string, Array<Record<string, unknown>>>;
}
const globalFallback = globalThis as unknown as GlobalFallback;
if (!globalFallback._krysoFallbackStore) {
  globalFallback._krysoFallbackStore = {};
}
const fallbackStore = globalFallback._krysoFallbackStore;

function getFallbackItems(name: string): Array<Record<string, unknown>> {
  if (fallbackStore[name] && Array.isArray(fallbackStore[name]) && fallbackStore[name].length > 0) {
    return fallbackStore[name];
  }
  const diskData = loadDiskFallback();
  if (diskData[name] && Array.isArray(diskData[name]) && diskData[name].length > 0) {
    fallbackStore[name] = diskData[name];
    return fallbackStore[name];
  }
  const defaultItems = DEFAULT_COLLECTIONS[name];
  if (defaultItems && Array.isArray(defaultItems)) {
    fallbackStore[name] = defaultItems.map((item) => ({ ...item }));
    return fallbackStore[name];
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || searchParams.get("collectionName");

    if (!name) {
      return NextResponse.json(
        { error: "Collection name parameter 'name' is required." },
        { status: 400 }
      );
    }

    // 1. Try Redis cache first for lightning-fast sub-millisecond response
    const cacheKey = `col:${name}`;
    const cachedData = await getCache<{
      success: boolean;
      source: string;
      collection: string;
      items: Array<Record<string, unknown>>;
    }>(cacheKey);

    if (cachedData && Array.isArray(cachedData.items) && cachedData.items.length > 0) {
      return NextResponse.json(
        {
          ...cachedData,
          source: "redis-cache",
        },
        {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
            "Surrogate-Control": "no-store",
          },
        }
      );
    }

    // 2. Fetch from MongoDB if cache miss
    const db = await getDb();
    if (db) {
      const items = await db.collection(name).find({}).toArray();

      const sanitized: Array<Record<string, unknown>> = items.map((doc) => {
        const { _id, ...rest } = doc;
        return {
          id: rest.id || _id.toString(),
          ...rest,
        };
      });

      if (name === "academy_students") {
        try {
          const enrollments = await db.collection("academy_enrollments").find({}).toArray();
          const existingKeys = new Set(
            sanitized.flatMap((it) => [
              it.id ? String(it.id) : "",
              it.invoiceNumber ? String(it.invoiceNumber) : "",
              it.paymentId ? String(it.paymentId) : "",
            ]).filter(Boolean)
          );
          for (const enr of enrollments) {
            const enrId = enr.id ? String(enr.id) : enr._id ? enr._id.toString() : "";
            const inv = enr.invoiceNumber ? String(enr.invoiceNumber) : "";
            const pay = enr.paymentId ? String(enr.paymentId) : "";

            if (!existingKeys.has(enrId) && (!inv || !existingKeys.has(inv)) && (!pay || !existingKeys.has(pay))) {
              sanitized.push({
                id: enrId || `STU-${inv || Date.now()}`,
                name: enr.studentName || enr.name || "Student",
                email: enr.email || "",
                mobile: enr.mobile || enr.phone || "",
                age: enr.age || "",
                dob: enr.dob || "",
                address: enr.address || "",
                course: enr.courseName || enr.course || "",
                teacher: enr.teacherName || "Kryso",
                fees: enr.fees || 0,
                level: "Enrolled Student",
                paymentStatus: enr.paymentStatus || "PAID Online",
                invoiceNumber: inv,
                paymentId: pay,
                joined: enr.createdAt
                  ? new Date(enr.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recent",
                createdAt: enr.createdAt || new Date().toISOString(),
              });
            }
          }
        } catch (syncErr) {
          console.warn("Could not merge academy_enrollments into students:", syncErr);
        }
      }

      let finalItems = sanitized;
      // If MongoDB collection is empty, seed it with default catalog data
      if (finalItems.length === 0) {
        const fallbacks = getFallbackItems(name);
        if (fallbacks.length > 0) {
          finalItems = fallbacks;
          try {
            const docs = fallbacks.map((it, idx) => ({
              ...it,
              order: it.order ?? idx,
              updatedAt: new Date(),
            }));
            await db.collection(name).insertMany(docs);
          } catch {}
        }
      }

      const responsePayload = {
        success: true,
        source: "mongodb",
        collection: name,
        items: finalItems,
      };

      // 3. Cache in Redis (TTL: 1 hour)
      await setCache(cacheKey, responsePayload, 60);

      return NextResponse.json(responsePayload, {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
          "Surrogate-Control": "no-store",
        },
      });
    }

    // Fallback when MongoDB is offline / restricted / unconfigured
    const fallbackItems = getFallbackItems(name);
    return NextResponse.json(
      {
        success: true,
        source: "fallback",
        collection: name,
        items: fallbackItems,
        message: "Database not connected. Operating in local storage mode.",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err) {
    console.error("GET collection API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch collection." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name || body.collectionName;
    const { item, items } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Collection name 'name' is required." },
        { status: 400 }
      );
    }

    // Always update in-memory fallback store and disk storage so server immediately reflects the changes
    if (Array.isArray(items)) {
      fallbackStore[name] = items.map((it) => ({ ...it }));
    } else if (item && item.id) {
      const current = [...getFallbackItems(name)];
      const existsIdx = current.findIndex((it) => String(it.id) === String(item.id));
      if (existsIdx >= 0) {
        current[existsIdx] = { ...current[existsIdx], ...item };
      } else {
        current.unshift({ ...item });
      }
      fallbackStore[name] = current;
    }
    if (fallbackStore[name]) {
      saveDiskFallback(name, fallbackStore[name]);
    }

    const db = await getDb();
    if (db) {
      const col = db.collection(name);

      // If full array replace
      if (Array.isArray(items)) {
        await col.deleteMany({});
        if (items.length > 0) {
          const docs = items.map((it, idx) => ({
            ...it,
            order: idx,
            updatedAt: new Date(),
          }));
          await col.insertMany(docs);
        }

        // Invalidate Redis cache for this collection
        await invalidateCollectionsCache(name);

        return NextResponse.json({
          success: true,
          savedTo: "mongodb",
          count: items.length,
        });
      }

      // If single item upsert
      if (item && item.id) {
        const itemId = String(item.id);
        const query: Filter<Document> =
          ObjectId.isValid(itemId) && itemId.length === 24
            ? { $or: [{ id: itemId }, { _id: new ObjectId(itemId) }] }
            : { id: itemId };

        await col.updateOne(
          query,
          { $set: { ...item, id: itemId, updatedAt: new Date() } },
          { upsert: true }
        );

        // Invalidate Redis cache for this collection
        await invalidateCollectionsCache(name);

        return NextResponse.json({
          success: true,
          savedTo: "mongodb",
          item,
        });
      }
    }

    return NextResponse.json({
      success: true,
      savedTo: "local-state",
      item: item || (items ? items[0] : undefined),
      message: "Database unavailable, cached in server memory & browser local storage.",
    });
  } catch (err) {
    console.error("POST collection API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to save collection." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || searchParams.get("collectionName");
    const id = searchParams.get("id");

    if (!name) {
      return NextResponse.json(
        { error: "Collection name 'name' is required." },
        { status: 400 }
      );
    }

    // Always update in-memory fallback store and disk fallback
    if (id === "ALL") {
      fallbackStore[name] = [];
    } else if (id) {
      const current = getFallbackItems(name);
      fallbackStore[name] = current.filter(
        (it) =>
          String(it.id) !== String(id) &&
          String(it.invoiceNumber) !== String(id) &&
          String(it.paymentId) !== String(id)
      );
    }
    if (fallbackStore[name]) {
      saveDiskFallback(name, fallbackStore[name]);
    }

    const db = await getDb();
    if (db) {
      const col = db.collection(name);
      if (id === "ALL") {
        await col.deleteMany({});
        if (name === "academy_students") {
          try {
            await db.collection("academy_enrollments").deleteMany({});
          } catch {}
        }

        // Invalidate Redis cache
        await invalidateCollectionsCache(name, "academy_enrollments");

        return NextResponse.json({
          success: true,
          cleared: true,
          collection: name,
        });
      } else if (id) {
        const itemId = String(id);
        const query: Filter<Document> =
          ObjectId.isValid(itemId) && itemId.length === 24
            ? { $or: [{ id: itemId }, { _id: new ObjectId(itemId) }] }
            : { $or: [{ id: itemId }, { invoiceNumber: itemId }, { paymentId: itemId }] };

        const result = await col.deleteMany(query);

        // If deleting a student, also remove corresponding record from academy_enrollments collection
        if (name === "academy_students") {
          try {
            const enrollmentQuery: Filter<Document> =
              ObjectId.isValid(itemId) && itemId.length === 24
                ? { $or: [{ id: itemId }, { _id: new ObjectId(itemId) }, { invoiceNumber: itemId }, { paymentId: itemId }] }
                : { $or: [{ id: itemId }, { invoiceNumber: itemId }, { paymentId: itemId }] };
            await db.collection("academy_enrollments").deleteMany(enrollmentQuery);
          } catch (enrErr) {
            console.warn("Failed to delete from academy_enrollments:", enrErr);
          }
        }

        // Invalidate Redis cache
        await invalidateCollectionsCache(name, "academy_enrollments");

        return NextResponse.json({
          success: true,
          deletedCount: result.deletedCount,
          deletedId: id,
          collection: name,
        });
      }
    }

    return NextResponse.json({
      success: true,
      savedTo: "local-state",
      deletedId: id,
      collection: name,
    });
  } catch (err) {
    console.error("DELETE collection API error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to delete from collection." },
      { status: 500 }
    );
  }
}
