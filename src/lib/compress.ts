/**
 * Compresión client-side de recursos (S43/S44)
 * Audio → AAC/M4A via WebCodecs (rápido, nativo) con fallback a MP3 via lamejs
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
    Mp4Muxer?: {
      Muxer: new (opts: unknown) => {
        addAudioChunk: (chunk: unknown, meta: unknown, timestamp?: number) => void;
        finalize: () => void;
        target: { buffer: ArrayBuffer };
      };
      ArrayBufferTarget: new () => unknown;
    };
    AudioEncoder?: unknown;
    AudioData?: unknown;
  }
}

let lamePromise: Promise<NonNullable<typeof window.lamejs>> | null = null;
let muxerPromise: Promise<NonNullable<typeof window.Mp4Muxer>> | null = null;

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

function loadMp4Muxer(): Promise<NonNullable<typeof window.Mp4Muxer>> {
  if (typeof window !== "undefined" && window.Mp4Muxer) {
    return Promise.resolve(window.Mp4Muxer);
  }
  if (!muxerPromise) {
    muxerPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/lib/mp4-muxer.js";
      script.onload = () =>
        window.Mp4Muxer
          ? resolve(window.Mp4Muxer)
          : reject(new Error("No se pudo cargar el muxer M4A"));
      script.onerror = () =>
        reject(new Error("No se pudo cargar el muxer M4A"));
      document.head.appendChild(script);
    });
  }
  return muxerPromise;
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

async function decodeFile(file: File, onProgress?: (s: string) => void): Promise<AudioBuffer> {
  onProgress?.("Leyendo audio...");
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();
  onProgress?.("Decodificando audio...");
  try {
    return await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    audioCtx.close().catch(() => {});
  }
}

/* ── Vía rápida: WebCodecs → AAC/M4A (codificación nativa, ~tiempo real) ── */
async function compressAudioAac(
  file: File,
  kbps: number,
  onProgress?: (step: string) => void
): Promise<{ file: File; originalSize: number }> {
  const buffer = await decodeFile(file, onProgress);
  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;

  const AudioEncoderCtor = window.AudioEncoder as unknown as {
    isConfigSupported: (c: unknown) => Promise<{ supported?: boolean }>;
    new (init: { output: (chunk: unknown, meta: unknown) => void; error: (e: unknown) => void }): {
      configure: (c: unknown) => void;
      encode: (d: unknown) => void;
      flush: () => Promise<void>;
      close: () => void;
      encodeQueueSize: number;
    };
  };
  const AudioDataCtor = window.AudioData as unknown as new (init: {
    format: string;
    sampleRate: number;
    numberOfFrames: number;
    numberOfChannels: number;
    timestamp: number;
    data: Float32Array;
  }) => { close: () => void };

  const config = {
    codec: "mp4a.40.2",
    numberOfChannels: channels,
    sampleRate,
    bitrate: kbps * 1000,
  };
  const support = await AudioEncoderCtor.isConfigSupported(config);
  if (!support.supported) throw new Error("Codificación AAC no soportada en este navegador");

  const Mp4Muxer = await loadMp4Muxer();
  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    audio: { codec: "aac", numberOfChannels: channels, sampleRate },
    fastStart: "in-memory",
    firstTimestampBehavior: "offset",
  });

  onProgress?.("Comprimiendo a AAC (rápido)...");
  let encoderError: unknown = null;
  const encoder = new AudioEncoderCtor({
    output: (chunk, meta) => {
      const c = chunk as { timestamp: number };
      muxer.addAudioChunk(chunk, meta, c.timestamp);
    },
    error: (e) => {
      encoderError = e;
    },
  });
  encoder.configure(config);

  const totalFrames = buffer.length;
  const blockFrames = Math.max(1, Math.floor(sampleRate)); // ~1 segundo
  let offset = 0;
  let lastPct = -1;
  while (offset < totalFrames) {
    if (encoderError) throw encoderError;
    const frames = Math.min(blockFrames, totalFrames - offset);
    const planar = new Float32Array(frames * channels);
    for (let ch = 0; ch < channels; ch++) {
      planar.set(buffer.getChannelData(ch).subarray(offset, offset + frames), ch * frames);
    }
    const audioData = new AudioDataCtor({
      format: "f32-planar",
      sampleRate,
      numberOfFrames: frames,
      numberOfChannels: channels,
      timestamp: Math.round((offset / sampleRate) * 1_000_000),
      data: planar,
    });
    encoder.encode(audioData);
    audioData.close();
    offset += frames;
    const pct = Math.min(99, Math.round((offset / totalFrames) * 100));
    if (pct !== lastPct && pct % 5 === 0) {
      lastPct = pct;
      onProgress?.(`Comprimiendo a AAC (rápido)... ${pct}%`);
    }
    // no bloquear la UI
    if (encoder.encodeQueueSize > 8 || offset % (blockFrames * 5) === 0) {
      await new Promise((res) => setTimeout(res, 0));
    }
  }
  await encoder.flush();
  encoder.close();
  if (encoderError) throw encoderError;
  muxer.finalize();

  const outBuf = muxer.target.buffer;
  if (!outBuf || outBuf.byteLength < 10000) throw new Error("La compresión AAC produjo un archivo inválido");
  const blob = new Blob([outBuf], { type: "audio/mp4" });
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outFile = new File([blob], `${baseName}.m4a`, { type: "audio/mp4" });
  return { file: outFile, originalSize: file.size };
}

/* ── Fallback: MP3 via lamejs (todos los navegadores) ── */
function floatTo16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

async function compressAudioMp3(
  file: File,
  kbps: number,
  onProgress?: (step: string) => void
): Promise<{ file: File; originalSize: number }> {
  const buffer = await decodeFile(file, onProgress);
  const stereo = buffer.numberOfChannels >= 2;
  const pcmBytes = buffer.duration * buffer.sampleRate * (stereo ? 2 : 1) * 4;
  const useMono = stereo && pcmBytes > 700 * 1024 * 1024;
  const channels = useMono ? 1 : stereo ? 2 : 1;

  onProgress?.(`Comprimiendo a MP3 ${kbps}kbps${useMono ? " (mono)" : ""}...`);
  const lame = await loadLameJs();
  if (!lame?.Mp3Encoder) throw new Error("Encoder MP3 no disponible");
  const encoder = new lame.Mp3Encoder(channels, buffer.sampleRate, kbps);

  const left16 = floatTo16(buffer.getChannelData(0));
  const right16 = channels === 2 ? floatTo16(buffer.getChannelData(1)) : null;

  const chunks: BlobPart[] = [];
  const block = 1152 * 256;
  for (let i = 0; i < left16.length; i += block) {
    const l = left16.subarray(i, i + block);
    const r = right16 ? right16.subarray(i, i + block) : undefined;
    const enc = channels === 2 ? encoder.encodeBuffer(l, r as Int16Array) : encoder.encodeBuffer(l);
    if (enc.length > 0) chunks.push(new Uint8Array(enc));
    if (i % (block * 20) === 0) {
      onProgress?.(`Comprimiendo a MP3 ${kbps}kbps... ${Math.min(99, Math.round((i / left16.length) * 100))}%`);
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

/* ── Entrada principal: AAC rápido si hay WebCodecs, si no MP3 ── */
function compressAudioViaWorker(
  file: File,
  kbps: number,
  onProgress?: (step: string) => void
): Promise<{ file: File; originalSize: number }> {
  return new Promise((resolve, reject) => {
    file
      .arrayBuffer()
      .then((arrayBuffer) => {
        const worker = new Worker("/lib/compress-worker.js");
        const id = Math.random().toString(36).slice(2);
        let settled = false;
        const timeout = setTimeout(() => {
          if (!settled) {
            settled = true;
            worker.terminate();
            reject(new Error("Tiempo de compresión excedido"));
          }
        }, 20 * 60 * 1000);
        worker.onmessage = (e: MessageEvent) => {
          const m = (e.data || {}) as {
            id?: string;
            progress?: number;
            step?: string;
            ok?: boolean;
            buffer?: ArrayBuffer;
            name?: string;
            type?: string;
            originalSize?: number;
            error?: string;
          };
          if (m.id !== id) return;
          if (typeof m.progress === "number") {
            onProgress?.(m.step || "Comprimiendo...");
            return;
          }
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          worker.terminate();
          if (m.ok && m.buffer) {
            const type = m.type || "audio/mpeg";
            const blob = new Blob([m.buffer], { type });
            const out = new File([blob], m.name || file.name, { type });
            resolve({ file: out, originalSize: m.originalSize || file.size });
          } else {
            reject(new Error(m.error || "Error en el compresor"));
          }
        };
        worker.onerror = (e) => {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            worker.terminate();
            reject(new Error(e.message || "Error del worker de compresión"));
          }
        };
        onProgress?.("Leyendo audio...");
        worker.postMessage({ id, buffer: arrayBuffer, kbps, filename: file.name }, [arrayBuffer]);
      })
      .catch(reject);
  });
}

export async function compressAudio(
  file: File,
  kbps: number,
  onProgress?: (step: string) => void
): Promise<{ file: File; originalSize: number }> {
  // 1) Vía Web Worker: no bloquea la página y soporta audios largos (meditaciones)
  if (typeof window !== "undefined" && typeof Worker !== "undefined") {
    try {
      return await compressAudioViaWorker(file, kbps, onProgress);
    } catch (e) {
      console.warn("[compress] Worker falló, usando main thread:", e);
      onProgress?.("Usando compresión en la página...");
    }
  }
  // 2) Fallback main thread — solo audios chicos (los grandes congelarían la pestaña)
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("El audio es muy largo para comprimirlo en este navegador");
  }
  const hasWebCodecs =
    typeof window !== "undefined" &&
    typeof window.AudioEncoder !== "undefined" &&
    typeof window.AudioData !== "undefined";
  if (hasWebCodecs) {
    try {
      return await compressAudioAac(file, kbps, onProgress);
    } catch (e) {
      console.warn("[compress] AAC falló, usando MP3:", e);
      onProgress?.("Usando compresión MP3 (más lenta)...");
    }
  }
  return compressAudioMp3(file, kbps, onProgress);
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
