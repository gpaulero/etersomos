import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function GET() {
  try {
    // Verify credentials match expected values
    const debug = {
      ACCOUNT_ID: (process.env.R2_ACCOUNT_ID || "").substring(0, 12),
      KEY_ID: (process.env.R2_ACCESS_KEY_ID || "").substring(0, 12),
      SECRET: (process.env.R2_SECRET_ACCESS_KEY || "").substring(0, 12),
      BUCKET: process.env.R2_BUCKET_NAME,
    };

    const { S3Client, ListObjectsV2Command } = await import("@aws-sdk/client-s3");

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME || "etersomos-recursos",
        Prefix: "recursos/",
      })
    );

    const resources = (result.Contents || [])
      .filter((obj) => obj.Key && obj.Key !== "recursos/" && obj.Size! > 0)
      .map((obj) => ({
        key: obj.Key!,
        name: obj.Key!.split("/").pop()!,
        size: obj.Size!,
        lastModified: obj.LastModified!.toISOString(),
        url: `/api/resources/download?key=${encodeURIComponent(obj.Key!)}`,
      }));

    return NextResponse.json({ resources });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : "UnknownError";
    console.error("R2 Error:", name, message);
    return NextResponse.json(
      { error: name, detail: message.substring(0, 500) },
      { status: 500 }
    );
  }
}
