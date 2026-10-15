import { useState, useRef, useEffect, useCallback } from 'react';
import { RecorderConfig, LibraryItem } from '../types';
import { QUALITY_PRESETS, getSupportedMimeType } from '../utils/recorderPresets';
import { mixAudioStreams, MixedAudioResult } from '../utils/audioMixer';
import { VideoCompositor } from '../utils/compositor';
import { saveMediaItem } from '../utils/storage';

export function useScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastRecordedItem, setLastRecordedItem] = useState<LibraryItem | null>(null);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mixedAudioRef = useRef<MixedAudioResult | null>(null);
  const compositorRef = useRef<VideoCompositor | null>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const camVideoRef = useRef<HTMLVideoElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const activeConfigRef = useRef<RecorderConfig | null>(null);

  // Clean up all streams and nodes
  const cleanupStreams = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (mixedAudioRef.current) {
      mixedAudioRef.current.cleanup();
      mixedAudioRef.current = null;
    }
    if (compositorRef.current) {
      compositorRef.current.stop();
      compositorRef.current = null;
    }
    if (screenVideoRef.current) {
      screenVideoRef.current.pause();
      screenVideoRef.current.srcObject = null;
      screenVideoRef.current = null;
    }
    if (camVideoRef.current) {
      camVideoRef.current.pause();
      camVideoRef.current.srcObject = null;
      camVideoRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 0.1);
      }, 100);
    }
  }, []);

  const startRecording = async (config: RecorderConfig) => {
    setError(null);
    setDuration(0);
    recordedChunksRef.current = [];
    activeConfigRef.current = config;

    const preset = QUALITY_PRESETS[config.quality] || QUALITY_PRESETS['1080p'];

    try {
      let displayStream: MediaStream | null = null;
      let micStream: MediaStream | null = null;
      let camStream: MediaStream | null = null;

      // 1. Get Screen Stream if mode includes screen
      if (config.mode === 'screen-cam' || config.mode === 'screen-only') {
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: preset.width },
            height: { ideal: preset.height },
            frameRate: { ideal: config.fps },
          },
          audio: config.includeSystemAudio ? true : false,
        });

        // Handle user clicking native browser "Stop sharing" bar
        const screenTrack = displayStream.getVideoTracks()[0];
        if (screenTrack) {
          screenTrack.onended = () => {
            stopRecording();
          };
        }
        screenStreamRef.current = displayStream;
      }

      // 2. Get Webcam Stream if mode includes cam
      if (config.mode === 'screen-cam' || config.mode === 'cam-only') {
        const camConstraints: MediaStreamConstraints = {
          video: config.camDeviceId
            ? { deviceId: { exact: config.camDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        };
        try {
          camStream = await navigator.mediaDevices.getUserMedia(camConstraints);
        } catch (camErr) {
          console.warn('Webcam permission not granted or device unavailable:', camErr);
        }
      }

      // 3. Get Microphone Stream if mic is enabled
      if (config.includeMic) {
        try {
          const micConstraints: MediaStreamConstraints = {
            audio: config.micDeviceId
              ? { deviceId: { exact: config.micDeviceId }, echoCancellation: true, noiseSuppression: true }
              : { echoCancellation: true, noiseSuppression: true },
            video: false,
          };
          micStream = await navigator.mediaDevices.getUserMedia(micConstraints);
          micStreamRef.current = micStream;
        } catch (micErr) {
          console.warn('Microphone permission not granted:', micErr);
        }
      }

      // 4. Mix Audio (system audio + mic)
      const mixed = mixAudioStreams(displayStream, micStream);
      mixedAudioRef.current = mixed;

      // Start live VU meter update
      if (mixed) {
        audioIntervalRef.current = window.setInterval(() => {
          setAudioLevel(mixed.getVolumeLevel());
        }, 80);
      }

      // 5. Build final recording video stream
      let finalVideoStream: MediaStream;

      if (config.mode === 'screen-cam' && displayStream && camStream) {
        // Use Compositor to blend Screen + Cam PiP bubble
        if (!hiddenCanvasRef.current) {
          hiddenCanvasRef.current = document.createElement('canvas');
        }
        const canvas = hiddenCanvasRef.current;

        const screenVideo = document.createElement('video');
        screenVideo.srcObject = displayStream;
        screenVideo.muted = true;
        await screenVideo.play();
        screenVideoRef.current = screenVideo;

        const camVideo = document.createElement('video');
        camVideo.srcObject = camStream;
        camVideo.muted = true;
        await camVideo.play();
        camVideoRef.current = camVideo;

        const compositor = new VideoCompositor(canvas, preset.width, preset.height);
        compositor.setSources(screenVideo, camVideo);
        compositor.updateConfig({
          camPosition: config.camPosition,
          camShape: config.camShape,
          camSizePercent: config.camSize,
          camMirrored: config.camMirrored,
          highlightClicks: config.showClickHighlight,
        });
        compositor.start();
        compositorRef.current = compositor;

        finalVideoStream = compositor.getStream(config.fps);
      } else if (config.mode === 'cam-only' && camStream) {
        finalVideoStream = camStream;
      } else if (displayStream) {
        finalVideoStream = displayStream;
      } else {
        throw new Error('No video source available for recording.');
      }

      // Combine video tracks + mixed audio tracks
      const finalTracks: MediaStreamTrack[] = [...finalVideoStream.getVideoTracks()];

      if (mixed && mixed.mixedStream.getAudioTracks().length > 0) {
        finalTracks.push(...mixed.mixedStream.getAudioTracks());
      } else if (displayStream && displayStream.getAudioTracks().length > 0) {
        finalTracks.push(...displayStream.getAudioTracks());
      } else if (micStream && micStream.getAudioTracks().length > 0) {
        finalTracks.push(...micStream.getAudioTracks());
      }

      const combinedStream = new MediaStream(finalTracks);

      // 6. Create MediaRecorder with optimized mimeType & bitrate
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: preset.bitrate,
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        cleanupStreams();

        const videoBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const recordDuration = duration;

        // Generate video thumbnail from first frame
        let thumbnail = '';
        try {
          const v = document.createElement('video');
          v.src = URL.createObjectURL(videoBlob);
          v.muted = true;
          await new Promise((res) => {
            v.onloadeddata = res;
          });
          const c = document.createElement('canvas');
          c.width = 320;
          c.height = 180;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, 320, 180);
            thumbnail = c.toDataURL('image/jpeg', 0.7);
          }
          URL.revokeObjectURL(v.src);
        } catch (thErr) {
          console.warn('Could not generate thumbnail:', thErr);
        }

        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
        const title = `Recording_${dateStr}_${timeStr}`;

        const item: LibraryItem = {
          id: `rec_${Date.now()}`,
          type: 'video',
          title,
          createdAt: Date.now(),
          blob: videoBlob,
          thumbnailUrl: thumbnail,
          duration: Math.max(1, Math.round(recordDuration)),
          fileSize: videoBlob.size,
          dimensions: { width: preset.width, height: preset.height },
          mimeType,
        };

        // Save to IndexedDB
        await saveMediaItem(item);
        setLastRecordedItem(item);
      };

      recorder.start(500); // 500ms chunk intervals
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsPaused(false);

      // Start duration counter
      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 0.1);
      }, 100);
    } catch (err: unknown) {
      cleanupStreams();
      const msg = err instanceof Error ? err.message : 'Failed to start screen recording';
      console.error('Recording initialization error:', err);
      setError(msg);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      cleanupStreams();
    };
  }, [cleanupStreams]);

  return {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    error,
    lastRecordedItem,
    setLastRecordedItem,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}
