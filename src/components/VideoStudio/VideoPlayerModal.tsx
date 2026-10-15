import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Scissors,
  Download,
  Camera,
  Music,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Clock,
  HardDrive,
  Check,
} from 'lucide-react';
import { LibraryItem } from '../../types';
import { formatBytes, formatDuration } from '../../utils/storage';
import { captureVideoFrame, trimVideo, extractAudioFromVideo } from '../../utils/videoEditor';
import { downloadBlob } from '../../utils/capture';

interface VideoPlayerModalProps {
  item: LibraryItem;
  onClose: () => void;
  onOpenInSnipping?: (imageDataUrl: string) => void;
  onTrimSaved?: (newItem: LibraryItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  onClose,
  onOpenInSnipping,
  onTrimSaved,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  // Trimming states
  const [isTrimMode, setIsTrimMode] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(item.duration || 0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimProgress, setTrimProgress] = useState(0);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');

  useEffect(() => {
    if (item.blob) {
      const url = URL.createObjectURL(item.blob);
      setVideoSrc(url);
      return () => URL.revokeObjectURL(url);
    } else if (item.dataUrl) {
      setVideoSrc(item.dataUrl);
    }
  }, [item]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
        setTrimEnd(dur);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    if (isTrimMode && curr >= trimEnd) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = trimStart;
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const { dataUrl } = captureVideoFrame(videoRef.current);
    if (onOpenInSnipping) {
      onOpenInSnipping(dataUrl);
      onClose();
    }
  };

  const handleDownload = () => {
    if (item.blob) {
      downloadBlob(item.blob, `${item.title}.webm`);
    }
  };

  const handleExtractAudio = async () => {
    if (!item.blob) return;
    setIsExtractingAudio(true);
    try {
      const wavBlob = await extractAudioFromVideo(item.blob);
      downloadBlob(wavBlob, `${item.title}_audio.wav`);
    } catch (err) {
      console.error('Audio extraction failed:', err);
    } finally {
      setIsExtractingAudio(false);
    }
  };

  const handleExecuteTrim = async () => {
    if (!item.blob || trimEnd <= trimStart) return;
    setIsTrimming(true);
    setTrimProgress(0);

    try {
      const trimmedBlob = await trimVideo(item.blob, trimStart, trimEnd, (pct) => {
        setTrimProgress(pct);
      });

      const trimmedDuration = Math.round(trimEnd - trimStart);
      const newItem: LibraryItem = {
        id: `rec_trimmed_${Date.now()}`,
        type: 'video',
        title: `${item.title}_trimmed`,
        createdAt: Date.now(),
        blob: trimmedBlob,
        duration: trimmedDuration,
        fileSize: trimmedBlob.size,
        mimeType: trimmedBlob.type,
      };

      if (onTrimSaved) {
        onTrimSaved(newItem);
      }
      downloadBlob(trimmedBlob, `${item.title}_cut.webm`);
      setIsTrimMode(false);
    } catch (err) {
      console.error('Trim error:', err);
    } finally {
      setIsTrimming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-sm text-neutral-200 truncate max-w-md">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span className="font-mono">{formatDuration(duration)}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-neutral-500" />
                <span className="font-mono">{formatBytes(item.fileSize)}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative bg-black flex-1 min-h-[360px] flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoSrc}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="max-h-[58vh] max-w-full cursor-pointer"
          />

          {/* Big Center Play button if paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
            >
              <Play className="w-6 h-6 ml-0.5" />
            </button>
          )}
        </div>

        {/* Video Controls & Scrubber */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col gap-3">
          {/* Main Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400 w-12 text-right">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.05"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 accent-indigo-500 cursor-pointer bg-neutral-800 rounded-lg"
            />
            <span className="text-xs font-mono text-neutral-400 w-12">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Trimming Mode Panel */}
          {isTrimMode && (
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Trim Video Clip</span>
                </span>
                <span className="font-mono text-neutral-400">
                  Cut: {formatDuration(trimStart)} — {formatDuration(trimEnd)} (
                  {formatDuration(trimEnd - trimStart)})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Start Point</label>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, trimEnd - 0.5)}
                    step="0.1"
                    value={trimStart}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTrimStart(val);
                      handleSeek(val);
                    }}
                    className="w-full h-1 accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">End Point</label>
                  <input
                    type="range"
                    min={Math.min(duration, trimStart + 0.5)}
                    max={duration}
                    step="0.1"
                    value={trimEnd}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTrimEnd(val);
                      handleSeek(val);
                    }}
                    className="w-full h-1 accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  onClick={() => setIsTrimMode(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteTrim}
                  disabled={isTrimming}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{isTrimming ? `Trimming (${trimProgress}%)` : 'Export Trimmed Cut'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleSeek(0)}
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Volume toggle */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-1.5 text-neutral-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (videoRef.current) {
                      videoRef.current.volume = val;
                      videoRef.current.muted = false;
                      setIsMuted(false);
                    }
                  }}
                  className="w-16 h-1 accent-neutral-400 cursor-pointer"
                />
              </div>

              {/* Speed buttons */}
              <div className="flex items-center gap-1 ml-3 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-[11px]">
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setPlaybackRate(spd);
                      if (videoRef.current) videoRef.current.playbackRate = spd;
                    }}
                    className={`px-1.5 py-0.5 rounded ${
                      playbackRate === spd ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Editing & Export Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCaptureFrame}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80 rounded-lg"
                title="Capture current video frame into Snipping & Annotation Studio"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Snap Frame</span>
              </button>

              <button
                onClick={() => setIsTrimMode(!isTrimMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-colors ${
                  isTrimMode
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Trim</span>
              </button>

              <button
                onClick={handleExtractAudio}
                disabled={isExtractingAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg"
                title="Extract audio only as WAV"
              >
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExtractingAudio ? 'Extracting...' : 'Audio WAV'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
