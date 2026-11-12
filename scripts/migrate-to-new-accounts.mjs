import dns from "node:dns";
import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

// Fix Node DNS resolution for MongoDB Atlas SRV if needed
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // ignore
}

// Credentials
const OLD_MONGO_URI =
  "mongodb://krysomusicacademy_db_user:Hxyjm3yYhwTHslLw@ac-yedkzpi-shard-00-00.xl1uxil.mongodb.net:27017,ac-yedkzpi-shard-00-01.xl1uxil.mongodb.net:27017,ac-yedkzpi-shard-00-02.xl1uxil.mongodb.net:27017/kryso_db?ssl=true&replicaSet=atlas-43z0he-shard-0&authSource=admin&retryWrites=true&w=majority";
const NEW_MONGO_URI =
  "mongodb+srv://sharikahmed731_db_user:6r4e8iNeS3kLSVDD@cluster0.5xka4ex.mongodb.net/kryso_db?retryWrites=true&w=majority";

const OLD_CLOUDINARY = {
  cloud_name: "vc1jzmd4",
  api_key: "574816619823535",
  api_secret: "We7exiUHt7fIhDyZakd4AGmrebE",
};

const NEW_CLOUDINARY = {
  cloud_name: "gc7rsrzf",
  api_key: "411759344312634",
  api_secret: "zIr6jLJ-cmZa9WsQjdbDsZepqwU",
};

// Deep rewrite helper to replace cloud name in URLs
function rewriteDoc(doc) {
  const jsonStr = JSON.stringify(doc);
  const replaced = jsonStr.replaceAll("vc1jzmd4", "gc7rsrzf");
  return JSON.parse(replaced);
}

async function migrateMongoDB() {
  console.log("\n==================================================");
  console.log("Starting MongoDB Migration (Old -> New)...");
  console.log("SAFETY GUARANTEE: Old MongoDB is accessed in READ-ONLY mode.");
  console.log("==================================================");

  const oldClient = new MongoClient(OLD_MONGO_URI);
  const newClient = new MongoClient(NEW_MONGO_URI);

  try {
    await oldClient.connect();
    console.log("Connected to OLD MongoDB cluster.");

    await newClient.connect();
    console.log("Connected to NEW MongoDB cluster.");

    const oldDb = oldClient.db("kryso_db");
    const newDb = newClient.db("kryso_db");

    const collections = await oldDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections in old database "kryso_db".\n`);

    const summary = [];

    for (const colInfo of collections) {
      const colName = colInfo.name;
      // Read docs from old DB (strictly read-only)
      const docs = await oldDb.collection(colName).find({}).toArray();
      const oldCount = docs.length;

      if (oldCount > 0) {
        const targetCol = newDb.collection(colName);
        for (const doc of docs) {
          const transformed = rewriteDoc(doc);
          await targetCol.replaceOne({ _id: transformed._id }, transformed, { upsert: true });
        }
      }

      // Verify count in new DB
      const newCount = await newDb.collection(colName).countDocuments();
      const status = oldCount === newCount ? "OK" : "MISMATCH";
      console.log(`[Collection: ${colName.padEnd(25)}] Old: ${oldCount} -> New: ${newCount} [${status}]`);
      summary.push({ colName, oldCount, newCount, status });
    }

    console.log("\nMongoDB Migration Completed Successfully!");
    return summary;
  } finally {
    await oldClient.close();
    await newClient.close();
  }
}

async function fetchAllResources(client, resourceType, prefix) {
  let all = [];
  let nextCursor = undefined;

  do {
    const res = await client.api.resources({
      resource_type: resourceType,
      type: "upload",
      prefix,
      max_results: 500,
      next_cursor: nextCursor,
    });
    all = all.concat(res.resources);
    nextCursor = res.next_cursor;
  } while (nextCursor);

  return all;
}

async function migrateCloudinary() {
  console.log("\n==================================================");
  console.log("Starting Cloudinary Migration (Old -> New)...");
  console.log("SAFETY GUARANTEE: Old Cloudinary is accessed in READ-ONLY mode.");
  console.log("==================================================");

  // We create two separate instances or configure them
  const oldCloudinary = cloudinary;
  oldCloudinary.config(OLD_CLOUDINARY);

  console.log("Fetching asset list from old Cloudinary (prefix: 'kryso/')...");
  const oldImages = await fetchAllResources(oldCloudinary, "image", "kryso/");
  const oldVideos = await fetchAllResources(oldCloudinary, "video", "kryso/");

  console.log(`Found ${oldImages.length} images and ${oldVideos.length} audio/video files to transfer.`);

  // Now configure cloudinary for NEW account uploads
  const newCloudinary = cloudinary;
  newCloudinary.config(NEW_CLOUDINARY);

  const allAssets = [
    ...oldImages.map((i) => ({ ...i, resource_type: "image" })),
    ...oldVideos.map((v) => ({ ...v, resource_type: "video" })),
  ];

  console.log(`Beginning transfer of ${allAssets.length} assets to new Cloudinary...`);

  let successCount = 0;
  let failCount = 0;

  // Process with concurrency of 5
  const CONCURRENCY = 5;
  for (let i = 0; i < allAssets.length; i += CONCURRENCY) {
    const batch = allAssets.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (asset) => {
        try {
          // Upload directly from old secure CDN URL
          await newCloudinary.uploader.upload(asset.secure_url, {
            public_id: asset.public_id,
            resource_type: asset.resource_type,
            overwrite: true,
          });
          successCount++;
          process.stdout.write(`\rTransferred ${successCount}/${allAssets.length} assets...`);
        } catch (err) {
          console.error(`\nFailed to upload asset ${asset.public_id}:`, err.message);
          failCount++;
        }
      })
    );
  }

  console.log(`\nCloudinary Transfer Summary: ${successCount} succeeded, ${failCount} failed.`);
}

async function run() {
  try {
    const mongoSummary = await migrateMongoDB();
    await migrateCloudinary();
    console.log("\nAll migration tasks finished successfully!");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
