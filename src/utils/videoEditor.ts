/**
 * Video processing and export utilities for CapturePro PC
 */

export function captureVideoFrame(video: HTMLVideoElement): {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
} {
  const canvas = document.createElement('canvas');
  const width = video.videoWidth || 1920;
  const height = video.videoHeight || 1080;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(video, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/png');
  return {
    dataUrl,
    blob: dataURLToBlob(dataUrl),
    width,
    height,
  };
}

export function dataURLToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Trims a video file between startTime and endTime in-browser using MediaRecorder
 */
export async function trimVideo(
  videoBlob: Blob,
  startTime: number,
  endTime: number,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoBlob);
    video.muted = false;

    video.onloadedmetadata = async () => {
      try {
        const stream = (video as unknown as { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream }).captureStream
          ? (video as unknown as { captureStream: () => MediaStream }).captureStream()
          : null;

        if (!stream) {
          reject(new Error('Browser does not support video stream capture for trimming.'));
          return;
        }

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';

        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const trimmedBlob = new Blob(chunks, { type: mimeType });
          URL.revokeObjectURL(video.src);
          resolve(trimmedBlob);
        };

        const totalDuration = endTime - startTime;
        video.currentTime = startTime;

        video.ontimeupdate = () => {
          if (onProgress) {
            const current = video.currentTime - startTime;
            const pct = Math.min(100, Math.max(0, Math.round((current / totalDuration) * 100)));
            onProgress(pct);
          }

          if (video.currentTime >= endTime) {
            video.pause();
            recorder.stop();
          }
        };

        video.onseeked = () => {
          // Once seeked to start, begin recording and playing
          recorder.start(100);
          video.play().catch(reject);
        };
      } catch (err) {
        URL.revokeObjectURL(video.src);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video for trimming: ' + e));
    };
  });
}

/**
 * Extracts audio track from video blob and exports as audio/webm
 */
export async function extractAudioFromVideo(videoBlob: Blob): Promise<Blob> {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const arrayBuffer = await videoBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Convert AudioBuffer to WAV format
  const wavBlob = audioBufferToWav(audioBuffer);
  audioContext.close();
  return wavBlob;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out], { type: 'audio/wav' });
}
