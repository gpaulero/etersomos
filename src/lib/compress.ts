/**
 * Compresión client-side de recursos (S43)
 * Audio → MP3 (lamejs cargado desde /lib/lame.min.js)
 * Imágenes JPG/PNG → WebP (canvas)
 */

declare global {
  interface Window {
    lamejs?: {
      Mp3Encoder: new (
        channels: number,
        sampleRate: number,
        kbps: number
      ) => {
        encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array;
        flush(): Int8Array;
      };
    };
  }
}

let lamePromise: Promise<NonNullable<typeof window.lamejs>> | null = null;

function loadLameJs(): Promise<NonNullable<typeof window.lamejs>> {
  if (typeof window !== "undefined" && window.lamejs) {
    return Promise.resolve(window.lamejs);
  }
  if (!lamePromise) {
    lamePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/lib/lame.min.js";
      script.onload = () =>
        window.lamejs
          ? resolve(window.lamejs)
          : reject(new Error("No se pudo cargar el encoder MP3"));
      script.onerror = () =>
        reject(new Error("No se pudo cargar el encoder MP3"));
      document.head.appendChild(script);
    });
  }
  return lamePromise;
}

export function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

export function isCompressibleAudio(file: File): boolean {
  const ext = (file.name.toLowerCase().split(".").pop() || "");
  return (
    ["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext) ||
    file.type.startsWith("audio/")
  );
}

export function isCompressibleImage(file: File): boolean {
  const ext = (file.name.toLowerCase().split(".").pop() || "");
  return (
    ["jpg", "jpeg", "png"].includes(ext) ||
    ["image/jpeg", "image/png"].includes(file.type)
  );
}

function floatTo16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export async function compressAudio(
  file: File,
  kbps: number,
  onProgress?: (step: string) => void
): Promise<{ file: File; originalSize: number }> {
  onProgress?.("Leyendo audio...");
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioCtx = new AudioCtx();
  onProgress?.("Decodificando audio...");
  let buffer: AudioBuffer;
  try {
    buffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    audioCtx.close().catch(() => {});
  }

  const stereo = buffer.numberOfChannels >= 2;
  // Archivos muy largos: mixdown a mono para no agotar memoria del navegador
  const pcmBytes = buffer.duration * audioCtx.sampleRate * (stereo ? 2 : 1) * 4;
  const useMono = stereo && pcmBytes > 700 * 1024 * 1024;
  const channels = useMono ? 1 : stereo ? 2 : 1;

  onProgress?.(
    `Comprimiendo a MP3 ${kbps}kbps${useMono ? " (mono, archivo largo)" : ""}...`
  );
  const lame = await loadLameJs();
  if (!lame?.Mp3Encoder) throw new Error("Encoder MP3 no disponible");
  const encoder = new lame.Mp3Encoder(channels, audioCtx.sampleRate, kbps);

  const left16 = floatTo16(buffer.getChannelData(0));
  const right16 =
    channels === 2 ? floatTo16(buffer.getChannelData(1)) : null;

  const chunks: BlobPart[] = [];
  const block = 1152 * 256;
  for (let i = 0; i < left16.length; i += block) {
    const l = left16.subarray(i, i + block);
    const r = right16 ? right16.subarray(i, i + block) : undefined;
    const enc =
      channels === 2
        ? encoder.encodeBuffer(l, r as Int16Array)
        : encoder.encodeBuffer(l);
    if (enc.length > 0) chunks.push(new Uint8Array(enc));
    if (i % (block * 20) === 0) {
      onProgress?.(
        `Comprimiendo a MP3 ${kbps}kbps... ${Math.min(
          99,
          Math.round((i / left16.length) * 100)
        )}%`
      );
      await new Promise((res) => setTimeout(res, 0));
    }
  }
  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(new Uint8Array(tail));

  const blob = new Blob(chunks, { type: "audio/mpeg" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outFile = new File([blob], `${baseName}.mp3`, { type: "audio/mpeg" });
  return { file: outFile, originalSize: file.size };
}

export async function compressImage(
  file: File,
  onProgress?: (step: string) => void
): Promise<{ file: File; originalSize: number }> {
  onProgress?.("Optimizando imagen...");
  const bitmap = await createImageBitmap(file);
  const MAX_W = 2560;
  const scale = Math.min(1, MAX_W / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85)
  );
  if (!blob) throw new Error("No se pudo convertir la imagen");
  if (blob.size >= file.size) {
    return { file, originalSize: file.size };
  }
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outFile = new File([blob], `${baseName}.webp`, { type: "image/webp" });
  return { file: outFile, originalSize: file.size };
}
