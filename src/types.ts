export type ActiveTab = 'recorder' | 'capture' | 'library';

export type VideoQuality = '4k' | '2k' | '1080p' | '720p';

export interface QualitySetting {
  id: VideoQuality;
  label: string;
  width: number;
  height: number;
  fps: number;
  bitrate: number; // in bps
  description: string;
}

export type RecordMode = 'screen-cam' | 'screen-only' | 'cam-only';

export type CamPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
export type CamShape = 'circle' | 'rounded' | 'square';

export interface RecorderConfig {
  mode: RecordMode;
  quality: VideoQuality;
  fps: 60 | 30;
  includeMic: boolean;
  includeSystemAudio: boolean;
  micDeviceId: string;
  camDeviceId: string;
  camPosition: CamPosition;
  camShape: CamShape;
  camSize: number; // percentage of video width, e.g. 18%
  camMirrored: boolean;
  showClickHighlight: boolean;
}

export interface LibraryItem {
  id: string;
  type: 'video' | 'screenshot';
  title: string;
  createdAt: number;
  blob?: Blob;
  dataUrl?: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds for videos
  fileSize: number; // in bytes
  dimensions?: { width: number; height: number };
  mimeType: string;
}

export type AnnotationTool =
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'arrow'
  | 'rect'
  | 'circle'
  | 'step'
  | 'text'
  | 'blur'
  | 'loupe'
  | 'crop';

export interface AnnotationElement {
  id: string;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  text?: string;
  fontSize?: number;
  stepNumber?: number;
  fill?: boolean;
}
