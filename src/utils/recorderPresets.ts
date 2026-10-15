import { QualitySetting } from '../types';

export const QUALITY_PRESETS: Record<string, QualitySetting> = {
  '4k': {
    id: '4k',
    label: '4K Ultra HD',
    width: 3840,
    height: 2160,
    fps: 60,
    bitrate: 14000000, // 14 Mbps
    description: 'Crisp 2160p @ 60fps for high-end monitors & game captures',
  },
  '2k': {
    id: '2k',
    label: '1440p Quad HD',
    width: 2560,
    height: 1440,
    fps: 60,
    bitrate: 8000000, // 8 Mbps
    description: 'Standard 2K PC display clarity with smooth 60fps',
  },
  '1080p': {
    id: '1080p',
    label: '1080p Full HD',
    width: 1920,
    height: 1080,
    fps: 60,
    bitrate: 5000000, // 5 Mbps
    description: 'Recommended for tutorials, presentations & meetings',
  },
  '720p': {
    id: '720p',
    label: '720p HD Compact',
    width: 1280,
    height: 720,
    fps: 30,
    bitrate: 2500000, // 2.5 Mbps
    description: 'Lightweight file size, ideal for fast sharing or email',
  },
};

export function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4',
  ];

  for (const t of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return 'video/webm';
}
