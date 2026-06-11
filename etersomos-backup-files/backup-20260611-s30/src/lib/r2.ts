import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || "etersomos-recursos";

export interface ResourceItem {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  url: string;
}

export async function listResources(): Promise<ResourceItem[]> {
  const result = await r2Client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: "recursos/",
    })
  );
  return (result.Contents || [])
    .filter((obj) => obj.Key && obj.Key !== "recursos/" && obj.Size! > 0)
    .map((obj) => ({
      key: obj.Key!,
      name: obj.Key!.split("/").pop()!,
      size: obj.Size!,
      lastModified: obj.LastModified!.toISOString(),
      url: `/api/resources/download?key=${encodeURIComponent(obj.Key!)}`,
    }));
}

export async function uploadResource(file: File) {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const key = `recursos/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return {
    key,
    name: fileName,
    size: buffer.length,
    lastModified: new Date().toISOString(),
  };
}

export async function deleteResource(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function getPresignedUploadUrl(fileName: string, contentType: string) {
  const timestamp = Date.now();
  const key = `recursos/${timestamp}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(r2Client, command, { expiresIn: 600 });
  return { url, key };
}

export async function getResourceStream(key: string) {
  const result = await r2Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
  return result;
}

/* ── Course content upload helpers (cursos/ prefix) ── */

export async function getPresignedCourseUploadUrl(fileName: string, contentType: string) {
  const timestamp = Date.now();
  const key = `cursos/${timestamp}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(r2Client, command, { expiresIn: 600 });
  return { url, key };
}

export async function uploadCourseResource(file: File, customKey?: string) {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const key = customKey || `cursos/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return {
    key,
    name: fileName,
    size: buffer.length,
    lastModified: new Date().toISOString(),
  };
}

export async function listCourseResources(courseId?: string) {
  const prefix = courseId ? `cursos/${courseId}/` : "cursos/";
  const result = await r2Client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    })
  );
  return (result.Contents || [])
    .filter((obj) => obj.Key && obj.Key !== prefix && obj.Size! > 0)
    .map((obj) => ({
      key: obj.Key!,
      name: obj.Key!.split("/").pop()!,
      size: obj.Size!,
      lastModified: obj.LastModified!.toISOString(),
    }));
}

/* ── Lectura audio upload helpers (lecturas/ prefix) ── */

export async function getPresignedLecturaUploadUrl(fileName: string, contentType: string) {
  const timestamp = Date.now();
  const key = `lecturas/${timestamp}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(r2Client, command, { expiresIn: 600 });
  return { url, key };
}

/* ── Storage statistics ── */

export interface R2StorageStats {
  totalSize: number;        // total bytes across all prefixes
  totalObjects: number;
  prefixes: {
    recursos: { size: number; count: number };
    cursos:   { size: number; count: number };
    lecturas: { size: number; count: number };
  };
}

/**
 * Calculate storage usage across all prefixes in the R2 bucket.
 * Lists all objects, sums their sizes, and groups by prefix.
 * Handles pagination (up to 5000 objects per prefix).
 */
export async function getR2StorageStats(): Promise<R2StorageStats> {
  const prefixes = ['recursos/', 'cursos/', 'lecturas/'] as const;
  const result: R2StorageStats = {
    totalSize: 0,
    totalObjects: 0,
    prefixes: {
      recursos: { size: 0, count: 0 },
      cursos:   { size: 0, count: 0 },
      lecturas: { size: 0, count: 0 },
    },
  };

  for (const prefix of prefixes) {
    let continuationToken: string | undefined;
    let size = 0;
    let count = 0;

    do {
      const response = await r2Client.send(
        new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        })
      );

      for (const obj of response.Contents || []) {
        if (obj.Key && obj.Key !== prefix && (obj.Size ?? 0) > 0) {
          size += obj.Size!;
          count++;
        }
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);

    const key = prefix.replace('/', '') as 'recursos' | 'cursos' | 'lecturas';
    result.prefixes[key] = { size, count };
    result.totalSize += size;
    result.totalObjects += count;
  }

  return result;
}

export async function uploadLecturaResource(file: File) {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const key = `lecturas/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'audio/mpeg',
    })
  );

  return {
    key,
    name: fileName,
    size: buffer.length,
    lastModified: new Date().toISOString(),
  };
}

/* ── Lectura attachment upload helpers (lecturas/adjuntos/ prefix) ── */

export async function uploadLecturaAttachment(file: File) {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const key = `lecturas/adjuntos/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    })
  );

  return {
    key,
    name: fileName,
    size: buffer.length,
    lastModified: new Date().toISOString(),
  };
}
