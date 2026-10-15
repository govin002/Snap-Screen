import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Pause,
  Settings2,
  Sliders,
  Sparkles,
  MousePointer,
  FileText,
  AlertCircle,
  HelpCircle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  RecorderConfig,
  RecordMode,
  VideoQuality,
  CamPosition,
  CamShape,
  LibraryItem,
} from '../types';
import { QUALITY_PRESETS } from '../utils/recorderPresets';
import { useScreenRecorder } from '../hooks/useScreenRecorder';
import { formatDuration } from '../utils/storage';

interface RecorderDashboardProps {
  onRecordingFinished: (item: LibraryItem) => void;
  onOpenTeleprompter: () => void;
  onOpenShortcuts: () => void;
  onSwitchToSnipping: () => void;
}

export const RecorderDashboard: React.FC<RecorderDashboardProps> = ({
  onRecordingFinished,
  onOpenTeleprompter,
  onOpenShortcuts,
  onSwitchToSnipping,
}) => {
  // Recorder configuration
  const [mode, setMode] = useState<RecordMode>('screen-cam');
  const [quality, setQuality] = useState<VideoQuality>('1080p');
  const [fps, setFps] = useState<60 | 30>(60);
  const [includeMic, setIncludeMic] = useState<boolean>(true);
  const [includeSystemAudio, setIncludeSystemAudio] = useState<boolean>(true);
  const [camPosition, setCamPosition] = useState<CamPosition>('bottom-right');
  const [camShape, setCamShape] = useState<CamShape>('circle');
  const [camSize, setCamSize] = useState<number>(20);
  const [camMirrored, setCamMirrored] = useState<boolean>(true);
  const [showClickHighlight, setShowClickHighlight] = useState<boolean>(true);

  // Available devices
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [selectedCamId, setSelectedCamId] = useState<string>('');

  // Active recorder hook
  const {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    error,
    lastRecordedItem,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useScreenRecorder();

  // Enumerate hardware devices on PC
  useEffect(() => {
    async function getDevices() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const mics = devices.filter((d) => d.kind === 'audioinput');
          const cams = devices.filter((d) => d.kind === 'videoinput');
          setAudioDevices(mics);
          setVideoDevices(cams);
          if (mics.length > 0 && !selectedMicId) setSelectedMicId(mics[0].deviceId);
          if (cams.length > 0 && !selectedCamId) setSelectedCamId(cams[0].deviceId);
        }
      } catch (e) {
        console.warn('Device enumeration error:', e);
      }
    }
    getDevices();
  }, [selectedMicId, selectedCamId]);

  // When a recording finishes, notify parent
  useEffect(() => {
    if (lastRecordedItem) {
      onRecordingFinished(lastRecordedItem);
    }
  }, [lastRecordedItem, onRecordingFinished]);

  const handleStartRecording = () => {
    const config: RecorderConfig = {
      mode,
      quality,
      fps,
      includeMic,
      includeSystemAudio,
      micDeviceId: selectedMicId,
      camDeviceId: selectedCamId,
      camPosition,
      camShape,
      camSize,
      camMirrored,
      showClickHighlight,
    };
    startRecording(config);
  };

  const selectedPreset = QUALITY_PRESETS[quality];

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-10 max-w-5xl mx-auto w-full">
      {/* Error alert if any */}
      {error && (
        <div className="w-full mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={onOpenShortcuts}
            className="text-rose-300 underline hover:text-white font-medium"
          >
            Troubleshooting Guide
          </button>
        </div>
      )}

      {/* When recording is active, show the Live Recording Cockpit */}
      {isRecording ? (
        <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          {/* Animated pulsing background glow */}
          <div className="absolute inset-0 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

          {/* Red status indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isPaused ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span className="text-xs font-bold tracking-wider uppercase text-neutral-300">
              {isPaused ? 'Recording Paused' : 'Recording in Progress'}
            </span>
          </div>

          {/* Large Duration Readout */}
          <div className="text-5xl md:text-7xl font-extrabold font-mono tabular-nums text-white tracking-tight mb-6">
            {formatDuration(duration)}
          </div>

          {/* Live Audio VU Level bar */}
          <div className="w-64 max-w-full flex items-center gap-2 mb-8 bg-neutral-950/80 px-4 py-2 rounded-xl border border-neutral-800">
            {includeMic ? (
              <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, audioLevel)}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-rose-500 transition-all duration-75"
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 w-8 text-right">
              {audioLevel}%
            </span>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-4">
            {isPaused ? (
              <button
                onClick={resumeRecording}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm rounded-2xl border border-neutral-700 transition-transform active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-rose-950/50 transition-transform active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Finish &amp; Edit Video</span>
            </button>
          </div>

          {/* Floating Teleprompter trigger */}
          <div className="mt-6 flex items-center gap-3 text-xs text-neutral-400">
            <button
              onClick={onOpenTeleprompter}
              className="flex items-center gap-1.5 hover:text-white underline underline-offset-4"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Presenter Script Prompter</span>
            </button>
          </div>
        </div>
      ) : (
        /* Configuration & Setup Console */
        <div className="w-full flex flex-col gap-6">
          {/* Top Mode Cards */}
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              1. Choose Recording Mode
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'screen-cam' as RecordMode,
                  title: 'Screen + Webcam',
                  desc: 'Full screen / window with draggable webcam PiP circle',
                  icon: Layers,
                },
                {
                  id: 'screen-only' as RecordMode,
                  title: 'Screen Only',
                  desc: 'Clean display capture without camera overlay',
                  icon: Monitor,
                },
                {
                  id: 'cam-only' as RecordMode,
                  title: 'Webcam Only',
                  desc: 'High-res presenter camera recording',
                  icon: Camera,
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                      isSelected
                        ? 'bg-neutral-900 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-2 rounded-xl ${
                            isSelected
                              ? 'bg-indigo-600/20 text-indigo-400'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <h4 className="font-semibold text-sm text-neutral-100 mb-1">{m.title}</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality & Audio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resolution & FPS Settings */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Resolution &amp; Quality</span>
                  </h4>
                  {/* FPS toggle */}
                  <div className="flex items-center p-0.5 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
                    <button
                      onClick={() => setFps(60)}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        fps === 60 ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                      }`}
                    >
                      60 FPS
                    </button>
                    <button
                      onClick={() => setFps(30)}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        fps === 30 ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400'
                      }`}
                    >
                      30 FPS
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(['4k', '2k', '1080p', '720p'] as VideoQuality[]).map((q) => {
                    const preset = QUALITY_PRESETS[q];
                    const isSelected = quality === q;
                    return (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-neutral-800 border-indigo-500 text-white shadow-xs'
                            : 'border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div className="font-semibold text-xs text-white">{preset.label}</div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                          {preset.width}x{preset.height}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {selectedPreset.description}
                </p>
              </div>

              {/* Cursor click highlights */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Highlight mouse clicks</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showClickHighlight}
                    onChange={(e) => setShowClickHighlight(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Audio Hardware & Mixing Console */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PC Audio Mixing</span>
                </div>

                <div className="space-y-3">
                  {/* System Audio */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                    <div className="flex items-center gap-2.5">
                      {includeSystemAudio ? (
                        <Volume2 className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-neutral-500" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-neutral-200">
                          System / Tab Audio
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          Record gameplay, media &amp; PC app sounds
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSystemAudio}
                        onChange={(e) => setIncludeSystemAudio(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Microphone */}
                  <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        {includeMic ? (
                          <Mic className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <MicOff className="w-4 h-4 text-neutral-500" />
                        )}
                        <div>
                          <div className="text-xs font-semibold text-neutral-200">
                            Microphone Audio
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            Voice narration &amp; commentary
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeMic}
                          onChange={(e) => setIncludeMic(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* Microphone Device dropdown */}
                    {includeMic && audioDevices.length > 0 && (
                      <select
                        value={selectedMicId}
                        onChange={(e) => setSelectedMicId(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 mt-1 truncate"
                      >
                        {audioDevices.map((d) => (
                          <option key={d.deviceId} value={d.deviceId}>
                            {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Guide link */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Hardware echo cancellation active</span>
                <button
                  onClick={onOpenShortcuts}
                  className="hover:text-white flex items-center gap-1 underline underline-offset-2"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Setup Guide</span>
                </button>
              </div>
            </div>
          </div>

          {/* Webcam Overlay Customizer (if mode includes cam) */}
          {(mode === 'screen-cam' || mode === 'cam-only') && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
              <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Webcam Overlay Styling</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                {/* Cam Position */}
                {mode === 'screen-cam' && (
                  <div>
                    <label className="text-neutral-400 block mb-1.5 text-[11px]">Corner Position</label>
                    <select
                      value={camPosition}
                      onChange={(e) => setCamPosition(e.target.value as CamPosition)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                )}

                {/* Cam Shape */}
                <div>
                  <label className="text-neutral-400 block mb-1.5 text-[11px]">Bubble Shape</label>
                  <select
                    value={camShape}
                    onChange={(e) => setCamShape(e.target.value as CamShape)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="circle">Circular Avatar</option>
                    <option value="rounded">Rounded Rectangle</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                {/* Cam Size */}
                {mode === 'screen-cam' && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
                      <span>Size</span>
                      <span className="font-mono">{camSize}%</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="32"
                      value={camSize}
                      onChange={(e) => setCamSize(parseInt(e.target.value))}
                      className="w-full h-1.5 accent-indigo-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Mirror toggle */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer p-2">
                    <input
                      type="checkbox"
                      checked={camMirrored}
                      onChange={(e) => setCamMirrored(e.target.checked)}
                      className="rounded accent-indigo-500"
                    />
                    <span>Mirror webcam</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Big Start Recording CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenTeleprompter}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-xl border border-neutral-700 transition-colors"
                title="Launch teleprompter script window for presenter"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Presenter Script</span>
              </button>

              <button
                onClick={onSwitchToSnipping}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-xl border border-neutral-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Snipping Tool</span>
              </button>
            </div>

            <button
              onClick={handleStartRecording}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-950/40 transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full bg-white animate-ping" />
              <span>Start PC Recording</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
