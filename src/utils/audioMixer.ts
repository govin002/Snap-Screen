export interface MixedAudioResult {
  mixedStream: MediaStream;
  analyser: AnalyserNode;
  cleanup: () => void;
  getVolumeLevel: () => number; // 0 to 100
}

export function mixAudioStreams(
  systemAudioStream?: MediaStream | null,
  micAudioStream?: MediaStream | null
): MixedAudioResult | null {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const destination = audioContext.createMediaStreamDestination();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  const pcmData = new Uint8Array(analyser.frequencyBinCount);

  let hasAudio = false;

  if (systemAudioStream && systemAudioStream.getAudioTracks().length > 0) {
    try {
      const sysSource = audioContext.createMediaStreamSource(systemAudioStream);
      sysSource.connect(destination);
      sysSource.connect(analyser);
      hasAudio = true;
    } catch (e) {
      console.warn('Could not connect system audio stream:', e);
    }
  }

  if (micAudioStream && micAudioStream.getAudioTracks().length > 0) {
    try {
      const micSource = audioContext.createMediaStreamSource(micAudioStream);
      micSource.connect(destination);
      micSource.connect(analyser);
      hasAudio = true;
    } catch (e) {
      console.warn('Could not connect microphone stream:', e);
    }
  }

  if (!hasAudio) {
    audioContext.close();
    return null;
  }

  const getVolumeLevel = () => {
    analyser.getByteFrequencyData(pcmData);
    let sum = 0;
    for (let i = 0; i < pcmData.length; i++) {
      sum += pcmData[i];
    }
    const average = sum / pcmData.length;
    // Map 0-255 to 0-100%
    return Math.min(100, Math.round((average / 128) * 100));
  };

  const cleanup = () => {
    try {
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    } catch (e) {
      console.error('Error closing audio context:', e);
    }
  };

  return {
    mixedStream: destination.stream,
    analyser,
    cleanup,
    getVolumeLevel,
  };
}
