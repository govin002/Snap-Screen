# CapturePro PC — Screen Recorder & Snipping Studio

> Professional, hardware-accelerated PC screen recorder, webcam studio, audio mixer, and screenshot capture suite with real-time annotations, blur redaction, and in-browser video trimming.

[![Platform - Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue?logo=windows)](https://github.com/gowin297/capturepro-pc/releases/latest)
[![Platform - Linux](https://img.shields.io/badge/Platform-Linux%20(Ubuntu%2FFedora%2FArch)-orange?logo=linux)](https://github.com/gowin297/capturepro-pc/releases/latest)
[![GitHub Release](https://img.shields.io/github/v/release/gowin297/capturepro-pc?include_prereleases&label=Latest%20Release)](https://github.com/gowin297/capturepro-pc/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📥 Direct Downloads

Download the latest pre-built binaries directly from the [GitHub Releases Page](https://github.com/gowin297/capturepro-pc/releases/latest):

### 🪟 Windows (Windows 11 / 10 - 64-bit)

| Package | Format | Direct Download Link |
|---|---|---|
| **Windows Installer** | `.exe` (Setup Wizard) | [**Download CapturePro-Setup.exe**](https://github.com/gowin297/capturepro-pc/releases/latest/download/CapturePro-Setup-1.0.0.exe) |
| **Windows Portable** | `.exe` (Standalone) | [**Download CapturePro-Portable.exe**](https://github.com/gowin297/capturepro-pc/releases/latest/download/CapturePro-1.0.0-portable.exe) |

> **Tip:** If Windows SmartScreen prompts on first launch, click **More info** &rarr; **Run anyway**.

---

### 🐧 Linux (Ubuntu, Debian, Fedora, Arch, Mint)

| Package | Format | Direct Download Link |
|---|---|---|
| **Linux Universal (AppImage)** | `.AppImage` (All distros) | [**Download CapturePro.AppImage**](https://github.com/gowin297/capturepro-pc/releases/latest/download/CapturePro-1.0.0.AppImage) |
| **Debian / Ubuntu Package** | `.deb` | [**Download CapturePro_amd64.deb**](https://github.com/gowin297/capturepro-pc/releases/latest/download/CapturePro_1.0.0_amd64.deb) |

#### Running on Linux:
- **AppImage**:
  ```bash
  chmod +x CapturePro-1.0.0.AppImage
  ./CapturePro-1.0.0.AppImage
  ```
- **Debian / Ubuntu (.deb)**:
  ```bash
  sudo dpkg -i CapturePro_1.0.0_amd64.deb
  sudo apt-get install -f # resolve any dependencies if needed
  ```

---

## 🌐 Instant Web / Desktop PWA Version

You can also use CapturePro instantly without downloading any installer:
- **Open in Browser**: Visit the hosted web application.
- **1-Click Desktop PWA**: Click **Desktop App** in the navigation bar to install it as an independent desktop window with taskbar and desktop icons.

---

## ✨ Key Features

- **4K & 1080p Screen Recording**: Smooth 60 FPS recording of full screens, application windows, or browser tabs.
- **Webcam Picture-in-Picture (PiP)**: Draggable corner overlay with circular avatar, rounded rectangle, or square styling and mirror mode.
- **Dual Audio Mixing Engine**: Combines system audio (gameplay, video, meetings) with microphone commentary via Web Audio API with hardware echo cancellation and a live VU meter.
- **Pro Snipping & Markup Studio**:
  - Instant and delayed capture (3s / 5s / 10s countdown to capture hover states and right-click dropdown menus).
  - Paste any screenshot directly from your clipboard (`Ctrl + V`).
  - **Mosaic Blur / Pixelation Redaction** tool to hide passwords, emails, and sensitive keys.
  - **Numbered Step Badges** (①, ②, ③…) for creating step-by-step tutorials.
  - **Magnifier Loupe** (2× zoom circle lens) to emphasize fine UI details.
  - **One-Click Copy to Clipboard**: Writes PNG image blobs directly to the system clipboard.
- **In-Browser Video Trim Studio**: Cut out unwanted beginning/ending segments, step frame-by-frame, extract `.wav` audio, and export video clips.
- **Presenter Teleprompter**: Floating, resizable prompter with auto-scrolling speed and opacity controls.
- **100% Client-Side Privacy**: All video and image processing occurs strictly on your local PC hardware.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| `Space` | Pause or resume active recording / video playback |
| `Ctrl + V` | Paste image from clipboard into Snipping Studio |
| `Ctrl + Z` | Undo last annotation on canvas |
| `Ctrl + Y` | Redo annotation |
| `Alt + T` | Toggle presenter teleprompter window |
| `?` | Open Help & Audio Setup Guide |
| `Esc` | Close any active modal dialog |

---

## 🛠️ Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/gowin297/capturepro-pc.git
cd capturepro-pc
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run in Development Mode
```bash
npm run dev
```

### 4. Compile Desktop Executables Locally

- **Build for Windows (.exe)**:
  ```bash
  npm run desktop:build:win
  ```
  *Binaries will be generated in `release/CapturePro-Setup-1.0.0.exe`.*

- **Build for Linux (.AppImage and .deb)**:
  ```bash
  npm run desktop:build:linux
  ```
  *Binaries will be generated in `release/CapturePro-1.0.0.AppImage` and `release/CapturePro_1.0.0_amd64.deb`.*

- **Build for Both Platforms**:
  ```bash
  npm run desktop:build:all
  ```

---

## 🚀 Automated GitHub Releases (CI/CD)

This repository includes a multi-platform GitHub Actions workflow at [`.github/workflows/build-desktop.yml`](.github/workflows/build-desktop.yml).

To release a new version:
1. Tag your commit:
   ```bash
   git tag v1.0.0
   git push --tags
   ```
2. GitHub Actions will automatically compile on `windows-latest` and `ubuntu-latest` runners, and publish the `.exe`, `.AppImage`, and `.deb` files directly to your GitHub Releases page.

---

## 📄 License

MIT License. Open source and free for commercial and personal use.
