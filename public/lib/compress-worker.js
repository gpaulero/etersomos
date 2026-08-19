try { importScripts("/lib/lame.min.js", "/lib/mp4-muxer.js"); } catch (e) { /* se detecta en encode */ }
/* compress-worker.js — Compresión de audio en un Web Worker (no bloquea la página). */

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

function decodeAudio(arrayBuffer, sampleRate) {
  if (typeof OfflineAudioContext === "undefined") {
    return Promise.reject(new Error("OfflineAudioContext no disponible en worker"));
  }
  var ctx;
  try { ctx = new OfflineAudioContext(2, 1, sampleRate); }
  catch (e) { try { ctx = new OfflineAudioContext(1, 1, sampleRate); } catch (e2) { return Promise.reject(e2); } }
  return ctx.decodeAudioData(arrayBuffer);
}

function floatTo16(f32) {
  var out = new Int16Array(f32.length);
  for (var i = 0; i < f32.length; i++) {
    var s = Math.max(-1, Math.min(1, f32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
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
  if (!lame || !lame.Mp3Encoder) return Promise.reject(new Error("Encoder MP3 no disponible"));
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

function compressAudio(arrayBuffer, kbps, filename, onProgress) {
  onProgress(3, "Preparando...");
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
      return encodeAac(channelData, sampleRate, numChannels, kbps, filename, onProgress).catch(function () {
        return encodeMp3(channelData, sampleRate, numChannels, kbps, filename, onProgress);
      });
    }
    return encodeMp3(channelData, sampleRate, numChannels, kbps, filename, onProgress);
  });
}
