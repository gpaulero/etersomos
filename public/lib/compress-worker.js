try { importScripts("/lib/lame.min.js", "/lib/mp4-muxer.js"); } catch (e) { /* se detecta al usar */ }
/* compress-worker.js — Compresión de audio en Web Worker.
   Vía principal (S48): transcode STREAMING MP3→AAC con WebCodecs (memoria baja, cualquier duración).
   Fallback: decodeAudioData clásico (audios cortos) + AAC o lamejs/MP3. */

self.onmessage = function (e) {
  var msg = e.data || {};
  var id = msg.id;
  var buffer = msg.buffer;
  var kbps = msg.kbps || 64;
  var filename = msg.filename || "audio";
  compressAudio(buffer, kbps, filename, function (pct, step) {
    self.postMessage({ id: id, progress: pct, step: step });
  }).then(function (res) {
    self.postMessage({ id: id, ok: true, buffer: res.buffer, name: res.name, type: res.type, originalSize: buffer.byteLength }, [res.buffer]);
  }).catch(function (err) {
    self.postMessage({ id: id, ok: false, error: String((err && err.message) || err) });
  });
};

function caps() {
  return "caps: AudioDecoder=" + (typeof AudioDecoder !== "undefined") +
    " AudioEncoder=" + (typeof AudioEncoder !== "undefined") +
    " Mp4Muxer=" + (typeof Mp4Muxer !== "undefined") +
    " OfflineAudioContext=" + (typeof OfflineAudioContext !== "undefined");
}

function floatTo16(f32) {
  var out = new Int16Array(f32.length);
  for (var i = 0; i < f32.length; i++) {
    var s = Math.max(-1, Math.min(1, f32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/* ---------- Parser de cuadros MP3 (sin decodificar; solo divide el stream) ---------- */
var BITRATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
var BITRATES_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
var SR_V1 = [44100, 48000, 32000];
var SR_V2 = [22050, 24000, 16000];
var SR_V25 = [11025, 12000, 8000];

function parseMp3(uint8) {
  var i = 0;
  if (uint8.length > 10 && uint8[0] === 0x49 && uint8[1] === 0x44 && uint8[2] === 0x33) { // ID3v2
    var sz = ((uint8[6] & 0x7f) << 21) | ((uint8[7] & 0x7f) << 14) | ((uint8[8] & 0x7f) << 7) | (uint8[9] & 0x7f);
    i = 10 + sz;
  }
  var frames = [];
  var sampleRate = 0, channels = 2, samplesPerFrame = 1152, mpeg1 = true;
  var first = true;
  while (i + 4 <= uint8.length) {
    if (uint8[i] === 0x54 && uint8[i + 1] === 0x41 && uint8[i + 2] === 0x47) { i += 128; continue; } // TAG ID3v1
    if (uint8[i] !== 0xFF || (uint8[i + 1] & 0xE0) !== 0xE0) { i++; continue; }
    var b2 = uint8[i + 1], b3 = uint8[i + 2];
    var ver = (b2 >> 3) & 0x03;   // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
    var layer = (b2 >> 1) & 0x03; // 1=Layer III
    if (ver === 1 || layer !== 1) { i++; continue; }
    var brIdx = (b3 >> 4) & 0x0F, srIdx = (b3 >> 2) & 0x03, pad = (b3 >> 1) & 0x01;
    if (brIdx === 0 || brIdx === 15 || srIdx === 3) { i++; continue; }
    var isMpeg1 = ver === 3;
    var bitrate = (isMpeg1 ? BITRATES_V1[brIdx] : BITRATES_V2[brIdx]) * 1000;
    var sr = isMpeg1 ? SR_V1[srIdx] : (ver === 2 ? SR_V2[srIdx] : SR_V25[srIdx]);
    var frameSize = Math.floor((isMpeg1 ? 144 : 72) * bitrate / sr) + pad;
    if (frameSize < 8 || i + frameSize > uint8.length) { i++; continue; }
    if (first) {
      sampleRate = sr;
      channels = ((uint8[i + 3] >> 6) & 0x03) === 3 ? 1 : 2;
      mpeg1 = isMpeg1;
      samplesPerFrame = isMpeg1 ? 1152 : 576;
      first = false;
    }
    frames.push(new Uint8Array(uint8.buffer, uint8.byteOffset + i, frameSize));
    i += frameSize;
  }
  return { frames: frames, sampleRate: sampleRate, channels: channels, samplesPerFrame: samplesPerFrame };
}

function pickMp3Codec(sampleRate, numberOfChannels) {
  var candidates = ["mp3", "mp4a.6b", "mp4a.6c"];
  var chain = Promise.resolve(null);
  candidates.forEach(function (c) {
    chain = chain.then(function (found) {
      if (found) return found;
      return AudioDecoder.isConfigSupported({ codec: c, sampleRate: sampleRate, numberOfChannels: numberOfChannels })
        .then(function (sup) { return (sup && sup.supported) ? c : null; })
        .catch(function () { return null; });
    });
  });
  return chain;
}

/* ---------- Vía principal: streaming MP3 → AAC (memoria baja) ---------- */
function transcodeStreaming(uint8, kbps, filename, onProgress) {
  var parsed;
  try { parsed = parseMp3(uint8); } catch (e) { return Promise.reject(new Error("No se pudo analizar el MP3: " + e.message)); }
  if (!parsed.frames.length) return Promise.reject(new Error("No se encontraron cuadros MP3 en el archivo"));
  if (typeof AudioDecoder === "undefined" || typeof AudioEncoder === "undefined" || typeof AudioData === "undefined" || typeof Mp4Muxer === "undefined") {
    return Promise.reject(new Error("WebCodecs incompleto en este navegador (" + caps() + ")"));
  }
  return pickMp3Codec(parsed.sampleRate, parsed.channels).then(function (codec) {
    if (!codec) throw new Error("Este navegador no soporta decodificar MP3 por streaming (" + caps() + ")");
    onProgress(4, "Decodificando y comprimiendo por partes...");
    var muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
      audio: { codec: "aac", numberOfChannels: parsed.channels, sampleRate: parsed.sampleRate },
      fastStart: "in-memory",
      firstTimestampBehavior: "offset"
    });
    var encErr = null;
    var encoder = new AudioEncoder({
      output: function (chunk, meta) { muxer.addAudioChunk(chunk, meta, chunk.timestamp); },
      error: function (e) { encErr = encErr || e; }
    });
    var encCfg = { codec: "mp4a.40.2", sampleRate: parsed.sampleRate, numberOfChannels: parsed.channels, bitrate: kbps * 1000 };
    return AudioEncoder.isConfigSupported(encCfg).then(function (sup) {
      if (!sup || !sup.supported) throw new Error("Codificador AAC no soportado");
      encoder.configure(encCfg);
      var decErr = null;
      var decoder = new AudioDecoder({
        output: function (audioData) {
          try { encoder.encode(audioData); } catch (e) { encErr = encErr || e; }
          audioData.close();
        },
        error: function (e) { decErr = decErr || e; }
      });
      decoder.configure({ codec: codec, sampleRate: parsed.sampleRate, numberOfChannels: parsed.channels });
      var frames = parsed.frames;
      var ts = 0;
      var frameMicros = Math.round(parsed.samplesPerFrame / parsed.sampleRate * 1000000);
      var idx = 0;
      function pump() {
        while (idx < frames.length) {
          if (decErr) throw decErr;
          if (encErr) throw encErr;
          if (decoder.decodeQueueSize > 64) {
            return new Promise(function (r) { setTimeout(r, 0); }).then(pump);
          }
          decoder.decode(new EncodedAudioChunk({ type: "key", timestamp: ts, data: frames[idx] }));
          ts += frameMicros;
          idx++;
          if (idx % 250 === 0) {
            onProgress(4 + Math.round(idx / frames.length * 88), "Decodificando y comprimiendo por partes...");
          }
        }
        return Promise.resolve();
      }
      return pump()
        .then(function () { return decoder.flush(); })
        .then(function () { decoder.close(); if (decErr) throw decErr; return encoder.flush(); })
        .then(function () { encoder.close(); if (encErr) throw encErr; muxer.finalize();
          var outBuf = muxer.target.buffer;
          if (!outBuf || outBuf.byteLength < 10000) throw new Error("La compresión generó un archivo inválido");
          onProgress(96, "Finalizando...");
          var base = filename.replace(/\.[^.]+$/, "");
          return { buffer: outBuf, name: base + ".m4a", type: "audio/mp4" };
        });
    });
  });
}

/* ---------- Fallback clásico: decodeAudioData + AAC o lamejs ---------- */
function decodeAudio(arrayBuffer, sampleRate) {
  if (typeof OfflineAudioContext === "undefined") {
    return Promise.reject(new Error("OfflineAudioContext no disponible en el worker (" + caps() + ")"));
  }
  var ctx;
  try { ctx = new OfflineAudioContext(2, 1, sampleRate); }
  catch (e) { try { ctx = new OfflineAudioContext(1, 1, sampleRate); } catch (e2) { return Promise.reject(new Error("No se pudo crear el decodificador: " + e2)); } }
  return ctx.decodeAudioData(arrayBuffer);
}

function encodeAac(channelData, sampleRate, numChannels, kbps, filename, onProgress) {
  var config = { codec: "mp4a.40.2", sampleRate: sampleRate, numberOfChannels: numChannels, bitrate: kbps * 1000 };
  return AudioEncoder.isConfigSupported(config).then(function (support) {
    if (!support || !support.supported) throw new Error("AAC no soportado");
    var muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
      audio: { codec: "aac", numberOfChannels: numChannels, sampleRate: sampleRate },
      fastStart: "in-memory",
      firstTimestampBehavior: "offset"
    });
    var encoderError = null;
    var encoder = new AudioEncoder({
      output: function (chunk, meta) { muxer.addAudioChunk(chunk, meta, chunk.timestamp); },
      error: function (e) { encoderError = e; }
    });
    encoder.configure(config);
    var totalFrames = channelData[0].length;
    var blockFrames = Math.max(1, Math.floor(sampleRate));
    var offset = 0;
    function step() {
      while (offset < totalFrames && encoder.encodeQueueSize < 8) {
        if (encoderError) throw encoderError;
        var frames = Math.min(blockFrames, totalFrames - offset);
        var planar = new Float32Array(frames * numChannels);
        for (var ch = 0; ch < numChannels; ch++) planar.set(channelData[ch].subarray(offset, offset + frames), ch * frames);
        var audioData = new AudioData({ format: "f32-planar", sampleRate: sampleRate, numberOfFrames: frames, numberOfChannels: numChannels, timestamp: Math.round(offset / sampleRate * 1000000), data: planar });
        encoder.encode(audioData);
        audioData.close();
        offset += frames;
        onProgress(30 + Math.round(offset / totalFrames * 65), "Comprimiendo (AAC)...");
      }
      if (offset >= totalFrames) {
        return encoder.flush().then(function () {
          encoder.close();
          if (encoderError) throw encoderError;
          muxer.finalize();
          var outBuf = muxer.target.buffer;
          if (!outBuf || outBuf.byteLength < 10000) throw new Error("Salida AAC inválida");
          var base = filename.replace(/\.[^.]+$/, "");
          return { buffer: outBuf, name: base + ".m4a", type: "audio/mp4" };
        });
      }
      return new Promise(function (r) { setTimeout(r, 0); }).then(step);
    }
    return step();
  });
}

function encodeMp3(channelData, sampleRate, numChannels, kbps, filename, onProgress) {
  var lame = self.lamejs;
  if (!lame || !lame.Mp3Encoder) return Promise.reject(new Error("Encoder MP3 no disponible (importScripts falló)"));
  var encoder = new lame.Mp3Encoder(numChannels, sampleRate, kbps);
  var left16 = floatTo16(channelData[0]);
  var right16 = numChannels === 2 ? floatTo16(channelData[1]) : null;
  var chunks = [];
  var block = 1152 * 256;
  var i = 0;
  function step() {
    var end = Math.min(i + block * 10, left16.length);
    for (; i < end; i += block) {
      var l = left16.subarray(i, i + block);
      var r = right16 ? right16.subarray(i, i + block) : undefined;
      var enc = numChannels === 2 ? encoder.encodeBuffer(l, r) : encoder.encodeBuffer(l);
      if (enc.length > 0) chunks.push(new Uint8Array(enc));
      onProgress(30 + Math.round(i / left16.length * 65), "Comprimiendo (MP3)...");
    }
    if (i >= left16.length) {
      var tail = encoder.flush();
      if (tail.length > 0) chunks.push(new Uint8Array(tail));
      var total = 0; for (var k = 0; k < chunks.length; k++) total += chunks[k].length;
      var out = new Uint8Array(total);
      var o = 0; for (var m = 0; m < chunks.length; m++) { out.set(chunks[m], o); o += chunks[m].length; }
      if (out.byteLength < 10000) return Promise.reject(new Error("Salida MP3 inválida"));
      var base = filename.replace(/\.[^.]+$/, "");
      return Promise.resolve({ buffer: out.buffer, name: base + ".mp3", type: "audio/mpeg" });
    }
    return new Promise(function (r2) { setTimeout(r2, 0); }).then(step);
  }
  return step();
}

function classicDecodeEncode(arrayBuffer, kbps, filename, onProgress) {
  onProgress(6, "Decodificando audio (método clásico)...");
  var large = arrayBuffer.byteLength > 20 * 1024 * 1024;
  var decodeRate = large ? 22050 : 44100;
  return decodeAudio(arrayBuffer, decodeRate).then(function (buffer) {
    var numChannels = buffer.numberOfChannels;
    var sampleRate = buffer.sampleRate;
    onProgress(25, "Decodificado. Comprimiendo...");
    var channelData;
    if (large && numChannels > 1) {
      var len = buffer.length;
      var mono = new Float32Array(len);
      for (var ch = 0; ch < numChannels; ch++) {
        var d = buffer.getChannelData(ch);
        for (var i2 = 0; i2 < len; i2++) mono[i2] += d[i2] / numChannels;
      }
      channelData = [mono];
      numChannels = 1;
    } else {
      channelData = [];
      for (var ch2 = 0; ch2 < numChannels; ch2++) channelData.push(buffer.getChannelData(ch2));
    }
    var aacAvailable = typeof AudioEncoder !== "undefined" && typeof AudioData !== "undefined" && typeof Mp4Muxer !== "undefined";
    if (aacAvailable) {
      return encodeAac(channelData, sampleRate, numChannels, kbps, filename, onProgress).catch(function (e) {
        onProgress(28, "AAC falló (" + (e.message || e) + "), usando MP3...");
        return encodeMp3(channelData, sampleRate, numChannels, kbps, filename, onProgress);
      });
    }
    return encodeMp3(channelData, sampleRate, numChannels, kbps, filename, onProgress);
  });
}

function looksLikeMp3(uint8, filename) {
  if (/\.mp3$/i.test(filename || "")) return true;
  var i = 0;
  if (uint8.length > 10 && uint8[0] === 0x49 && uint8[1] === 0x44 && uint8[2] === 0x33) {
    var sz = ((uint8[6] & 0x7f) << 21) | ((uint8[7] & 0x7f) << 14) | ((uint8[8] & 0x7f) << 7) | (uint8[9] & 0x7f);
    i = 10 + sz;
  }
  return uint8[i] === 0xFF && (uint8[i + 1] & 0xE0) === 0xE0;
}

function compressAudio(arrayBuffer, kbps, filename, onProgress) {
  onProgress(2, "Analizando archivo...");
  var uint8 = new Uint8Array(arrayBuffer);
  if (looksLikeMp3(uint8, filename) &&
      typeof AudioDecoder !== "undefined" && typeof AudioEncoder !== "undefined" && typeof Mp4Muxer !== "undefined") {
    return transcodeStreaming(uint8, kbps, filename, onProgress).catch(function (e) {
      onProgress(3, "Streaming no disponible (" + (e.message || e) + "). Método clásico...");
      return classicDecodeEncode(arrayBuffer, kbps, filename, onProgress);
    });
  }
  return classicDecodeEncode(arrayBuffer, kbps, filename, onProgress);
}
