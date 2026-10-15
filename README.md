# CapturePro PC — Screen Recorder & Snipping Studio

> Professional, hardware-accelerated PC screen recorder, webcam studio, audio mixer, and screenshot capture suite with real-time annotations, blur redaction, and in-browser video trimming.

[![Release](https://img.shields.io/badge/Release-v1.0.0-indigo?style=flat-square&logo=github)](https://github.com/gowin297/capturepro-pc/releases/tag/v1.0.0)
[![Platform - Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=flat-square&logo=windows)](https://ais-dev-gq4drhi4etgfns74tlwr5v-22416287859.asia-east1.run.app/downloads/CapturePro-Windows.zip)
[![Platform - Linux](https://img.shields.io/badge/Platform-Linux%20(Ubuntu%2FFedora%2FArch)-FCC624?style=flat-square&logo=linux)](https://ais-dev-gq4drhi4etgfns74tlwr5v-22416287859.asia-east1.run.app/downloads/CapturePro_1.0.0_amd64.deb)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📥 Direct Downloads (Version 1.0.0 — Pre-Built Binaries)

> 💡 **Ready to use immediately:** These are pre-compiled desktop release packages. No source code or compilation needed.

### 🌟 All-in-One Release Bundle
| Package | Description | Direct Download |
|---|---|---|
| **Complete v1.0.0 Release ZIP** | Contains all Windows & Linux packages + setup scripts | [**Download `CapturePro-v1.0.0-Release-All.zip`**](https://ais-dev-gq4drhi4etgfns74tlwr5v-22416287859.asia-east1.run.app/downloads/CapturePro-v1.0.0-Release-All.zip) |

---

### 🐧 Linux (Ubuntu, Debian, Mint, Fedora, Arch, openSUSE)

| Package | Format | Direct Download | How to Run / Install |
|---|---|---|---|
| **Debian / Ubuntu Package** | `.deb` | [**Download `CapturePro_1.0.0_amd64.deb`**](https://ais-dev-gq4drhi4etgfns74tlwr5v-22416287859.asia-east1.run.app/downloads/CapturePro_1.0.0_amd64.deb) | `sudo dpkg -i CapturePro_1.0.0_amd64.deb` |
| **Universal Linux Desktop** | `.tar.gz` | [**Download `CapturePro-Linux-Desktop.tar.gz`**](https://ais-dev-gq4drhi4etgfns74tlwr5v-22416287859.asia-east1.run.app/downloads/CapturePro-Linux-Desktop.tar.gz) | Extract & run `./install.sh` *(No sudo required)* |
| **Quick Installer Script** | `.sh` | [**Download `install-linux.sh`**](https://ais-dev-gq4drhi4etgfns74tlwr5v-22416287859.asia-east1.run.app/downloads/install-linux.sh) | `bash install-linux.sh` |

#### Linux Installation Details:
- **Method A (Debian/Ubuntu/Mint)**:
  ```bash
  sudo dpkg -i CapturePro_1.0.0_amd64.deb
  ```
  *Includes `Installed-Size` header, `Depends: xdg-utils`, and automated desktop database update triggers.*

- **Method B (Universal Linux — No root/sudo required)**:
  ```bash
  tar -xzf CapturePro-Linux-Desktop.tar.gz
  cd capturepro-linux-universal
  ./install.sh
  ```
  *Installs directly into `~/.local/share/applications/capturepro.desktop` so CapturePro appears in your GNOME/KDE/XFCE app menu.*

---

### 🪟 Windows (Windows 11 / 10 - 64-bit)

| Package | Format | Direct Download | How to Run |
|---|---|---|---|
| **Windows Desktop Package** | `.zip` (PKZIP) | [**Download `CapturePro-Windows.zip`**](https://ais-dev-gq4drhi4etgfns74tlwr5v-22416287859.asia-east1.run.app/downloads/CapturePro-Windows.zip) | Extract & double-click `Launch-CapturePro.bat` |

#### Windows Running Details:
1. Download and extract **`CapturePro-Windows.zip`** *(Product by Gowin)*.
2. Double-click **`Launch-CapturePro.bat`**:
   - It will check and ask: *"Would you like to create a Desktop Shortcut? (Y/N)"*
   - If selected **Y**, it creates an official Windows Desktop Shortcut with the custom **`app.ico`** icon and description *"CapturePro PC — Product by Gowin"*.
   - Launches CapturePro in a dedicated desktop window without browser tabs or address bars.
3. You can also run **`Create-Desktop-Shortcut.vbs`** at any time to create the desktop icon.

---

## 🌐 Instant Web / Desktop PWA Version (Zero Download)

You can also run CapturePro instantly right now:
- **Web App**: Open the live application URL in your browser.
- **1-Click Desktop PWA**: Click **Desktop App** in the navigation bar &rarr; **Install to Desktop Now**.
  - Creates a standalone desktop window on Windows, macOS, or Linux.
  - Adds desktop and taskbar shortcuts with hardware-accelerated offline support.

---

## ✨ Key Features

- **4K & 1080p Screen Recording**: Smooth 60 FPS recording of full screens, application windows, or browser tabs.
- **Webcam Picture-in-Picture (PiP)**: Draggable corner overlay with circular avatar, rounded rectangle, or square styling and mirror mode.
- **Dual Audio Mixing Engine**: Combines PC system audio (gameplay, video, meetings) with microphone commentary via Web Audio API with hardware echo cancellation and a real-time VU meter.
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

## 🛠️ Building & Re-packaging from Source

### Prerequisites
- Node.js (v18 or newer)
- Python 3

### 1. Run Development Server
```bash
npm install
npm run dev
```

### 2. Build Production Web Assets
```bash
npm run build
```

### 3. Generate All Desktop Release Packages (.deb, Windows .zip, Linux .tar.gz)
```bash
python3 scripts/build_packages.py
```
*Outputs all tested, compliant binaries into `public/downloads/`.*

---

## 🚀 GitHub Actions Automated Releases (CI/CD)

The repository includes [`.github/workflows/build-desktop.yml`](.github/workflows/build-desktop.yml) configured with release title:
`CapturePro PC v1.0.0 — Screen Recorder & Snipping Studio`.

Whenever you push to GitHub:
```bash
git init
git remote add origin https://github.com/<your-username>/capturepro-pc.git
git add .
git commit -m "CapturePro PC v1.0.0"
git branch -M main
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions will automatically build Windows and Linux binaries and publish them to your GitHub Releases page.

---

## 📄 License

MIT License. Open source and free for commercial and personal use.
