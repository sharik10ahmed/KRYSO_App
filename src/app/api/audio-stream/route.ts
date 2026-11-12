import { NextRequest, NextResponse } from "next/server";
import { extractGoogleDriveId } from "@/lib/media-utils";
import { createReadStream, statSync, existsSync } from "fs";
import path from "path";
import { Readable } from "stream";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}

export async function HEAD(req: NextRequest) {
  const getRes = await GET(req);
  return new Response(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url");
    const driveId = searchParams.get("id") || (rawUrl ? extractGoogleDriveId(rawUrl) : null);

    if (!rawUrl && !driveId) {
      return NextResponse.json({ error: "Missing url or id parameter" }, { status: 400 });
    }

    // 1. Handle local files (e.g. /uploads/...)
    if (rawUrl && (rawUrl.startsWith("/uploads/") || rawUrl.startsWith("uploads/"))) {
      const cleanPath = rawUrl.replace(/^\/?uploads\//, "");
      const fullPath = path.join(process.cwd(), "public", "uploads", cleanPath);

      if (existsSync(fullPath)) {
        const stat = statSync(fullPath);
        const fileSize = stat.size;
        const range = req.headers.get("range");
        const ext = path.extname(cleanPath).toLowerCase();
        const contentType =
          ext === ".mp4"
            ? "video/mp4"
            : ext === ".wav"
            ? "audio/wav"
            : ext === ".m4a"
            ? "audio/m4a"
            : ext === ".ogg"
            ? "audio/ogg"
            : "audio/mpeg";

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = end - start + 1;
          const stream = createReadStream(fullPath, { start, end });
          const webStream = Readable.toWeb(stream) as ReadableStream;

          return new Response(webStream, {
            status: 206,
            headers: {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize.toString(),
              "Content-Type": contentType,
              "Content-Disposition": "inline",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
              "Cross-Origin-Resource-Policy": "cross-origin",
            },
          });
        } else {
          const stream = createReadStream(fullPath);
          const webStream = Readable.toWeb(stream) as ReadableStream;

          return new Response(webStream, {
            status: 200,
            headers: {
              "Content-Length": fileSize.toString(),
              "Accept-Ranges": "bytes",
              "Content-Type": contentType,
              "Content-Disposition": "inline",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
              "Cross-Origin-Resource-Policy": "cross-origin",
              "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
            },
          });
        }
      } else {
        return NextResponse.json({ error: "Local audio file not found" }, { status: 404 });
      }
    }

    // 2. Resolve Remote Target URL (Google Drive direct stream or remote http/https)
    let targetUrl = "";
    if (driveId) {
      targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&authuser=0&confirm=t`;
    } else if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))) {
      targetUrl = rawUrl;
    }

    if (targetUrl) {
      const fetchHeaders: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Encoding": "identity",
      };

      const rangeHeader = req.headers.get("range");
      if (rangeHeader) {
        fetchHeaders["Range"] = rangeHeader;
      }

      const upstreamRes = await fetch(targetUrl, {
        headers: fetchHeaders,
        redirect: "follow",
      });

      if (!upstreamRes.ok && upstreamRes.status !== 206 && upstreamRes.status !== 304) {
        return NextResponse.redirect(targetUrl, { status: 302 });
      }

      const responseHeaders = new Headers();
      let contentType = upstreamRes.headers.get("content-type") || "audio/mpeg";
      if (contentType.includes("octet-stream") || contentType.includes("text/plain")) {
        const lowerUrl = targetUrl.toLowerCase();
        contentType = lowerUrl.includes(".wav")
          ? "audio/wav"
          : lowerUrl.includes(".m4a")
          ? "audio/m4a"
          : lowerUrl.includes(".ogg")
          ? "audio/ogg"
          : "audio/mpeg";
      }

      responseHeaders.set("Content-Type", contentType);
      responseHeaders.set("Content-Disposition", "inline");
      responseHeaders.set("Accept-Ranges", "bytes");
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type, Accept");
      responseHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");

      const contentLength = upstreamRes.headers.get("content-length");
      if (contentLength) {
        responseHeaders.set("Content-Length", contentLength);
      }
      const contentRange = upstreamRes.headers.get("content-range");
      if (contentRange) {
        responseHeaders.set("Content-Range", contentRange);
      }
      const cacheControl =
        upstreamRes.headers.get("cache-control") ||
        "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
      responseHeaders.set("Cache-Control", cacheControl);

      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        headers: responseHeaders,
      });
    }

    return NextResponse.json({ error: "Invalid audio URL" }, { status: 400 });
  } catch (err) {
    console.error("Audio streaming error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to stream audio" },
      { status: 500 }
    );
  }
}
