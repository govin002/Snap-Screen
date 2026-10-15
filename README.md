# CapturePro PC — Screen Recorder & Snipping Studio

> Professional, hardware-accelerated PC screen recorder, webcam studio, audio mixer, and screenshot capture suite with real-time annotations, blur redaction, and in-browser video trimming.

[![Platform - Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-blue?logo=windows)](https://github.com/gowin297/capturepro-pc/releases/latest)
[![Platform - Linux](https://img.shields.io/badge/Platform-Linux%20(Ubuntu%2FFedora%2FArch)-orange?logo=linux)](https://github.com/gowin297/capturepro-pc/releases/latest)
[![GitHub Release](https://img.shields.io/github/v/release/gowin297/capturepro-pc?include_prereleases&label=Latest%20Release)](https://github.com/gowin297/capturepro-pc/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📥 Direct Downloads

Download the pre-built desktop binaries directly from GitHub Releases:

> ⚠️ **Why does a GitHub link show 404 right now?**
> On GitHub, release links (`/releases/latest/download/...`) only become active **after** you push this codebase to your GitHub repository and trigger the release tag (`v1.0.0`). Until you publish the release, GitHub does not have the files hosted yet.
> 
> 👉 See [**How to Publish the Release to GitHub**](#-how-to-publish-the-release-to-github) below to make these links live, or use the **[Instant Desktop PWA](#-instant-web--desktop-pwa-version)** to run it immediately without waiting!

### ⚡ Instant Direct Downloads (Ready to download right now)

Click below to download the packages directly:

| Platform | Format | Direct Download (Immediate) |
|---|---|---|
| **Linux (Debian / Ubuntu)** | `.deb` | [**Download CapturePro_1.0.0_amd64.deb**](/downloads/CapturePro_1.0.0_amd64.deb) |
| **Linux (All Distros)** | `.tar.gz` | [**Download CapturePro-Linux-Desktop.tar.gz**](/downloads/CapturePro-Linux-Desktop.tar.gz) |
| **Linux (Quick Script)** | `.sh` | [**Download install-linux.sh**](/downloads/install-linux.sh) |
| **Windows Desktop** | `.zip` | [**Download CapturePro-Windows.zip**](/downloads/CapturePro-Windows.zip) |

---

### 📦 GitHub Releases (After Pushing to GitHub)

If you have pushed this repository to GitHub and triggered the automated workflow, you can also download from:
- **Windows Setup**: [CapturePro-Setup.exe](https://github.com/gowin297/capturepro-pc/releases/latest/download/CapturePro-Setup-1.0.0.exe)
- **Linux AppImage**: [CapturePro.AppImage](https://github.com/gowin297/capturepro-pc/releases/latest/download/CapturePro-1.0.0.AppImage)

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

## 🚀 How to Publish the Release to GitHub

To make the download links live and fix the 404:

1. **Create the GitHub Repository**:
   Go to [github.com/new](https://github.com/new) and create a repository named `capturepro-pc` (or your preferred name).

2. **Push your code to GitHub**:
   ```bash
   git init
   git remote add origin https://github.com/gowin297/capturepro-pc.git
   git add .
   git commit -m "Initial commit of CapturePro PC"
   git branch -M main
   git push -u origin main
   ```

3. **Publish the Release Tag (triggers automated build)**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   *Alternatively, go to the **Actions** tab on your GitHub repository and click **Run workflow**.*

4. **GitHub Actions builds & uploads the binaries**:
   GitHub Actions will automatically run on Windows and Ubuntu runners, compile the files, and attach `CapturePro-Setup-1.0.0.exe`, `CapturePro-1.0.0.AppImage`, and `CapturePro_1.0.0_amd64.deb` to the release. Once complete (usually ~2-3 minutes), the download URLs are live!

---

## 📄 License

MIT License. Open source and free for commercial and personal use.
