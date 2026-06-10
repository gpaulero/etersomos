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
