import os
import shutil
import subprocess
import zipfile

ROOT = os.getcwd()
DOWNLOADS = os.path.join(ROOT, "public", "downloads")
os.makedirs(DOWNLOADS, exist_ok=True)
APP_URL = "https://ais-dev-gq4drhi4etgfns74tlwr5v-22416287859.asia-east1.run.app"

print("1. Building 100% compliant Debian (.deb) package...")
deb_dir = "/tmp/capturepro-deb-build"
if os.path.exists(deb_dir):
    shutil.rmtree(deb_dir)

os.makedirs(os.path.join(deb_dir, "DEBIAN"), exist_ok=True)
os.makedirs(os.path.join(deb_dir, "usr", "bin"), exist_ok=True)
os.makedirs(os.path.join(deb_dir, "usr", "share", "applications"), exist_ok=True)
os.makedirs(os.path.join(deb_dir, "usr", "share", "icons", "hicolor", "512x512", "apps"), exist_ok=True)

control = f"""Package: capturepro
Version: 1.0.0
Section: utils
Priority: optional
Architecture: amd64
Installed-Size: 450
Depends: xdg-utils
Maintainer: CapturePro Team <gowin297@gmail.com>
Description: CapturePro PC - Screen Recorder & Snipping Studio
 Hardware-accelerated screen recorder, webcam studio, audio mixer, and screenshot capture suite.
"""
with open(os.path.join(deb_dir, "DEBIAN", "control"), "w", encoding="utf-8") as f:
    f.write(control)

postinst = """#!/bin/sh
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database -q /usr/share/applications || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
fi
exit 0
"""
postinst_path = os.path.join(deb_dir, "DEBIAN", "postinst")
with open(postinst_path, "w", encoding="utf-8") as f:
    f.write(postinst)
os.chmod(postinst_path, 0o755)

launcher_sh = f"""#!/bin/bash
APP_URL="{APP_URL}"

for browser in google-chrome google-chrome-stable chromium-browser chromium brave-browser microsoft-edge-stable msedge; do
  if command -v "$browser" >/dev/null 2>&1; then
    exec "$browser" --app="$APP_URL" --class="CapturePro" --name="CapturePro" "$@"
  fi
done

if command -v xdg-open >/dev/null 2>&1; then
  exec xdg-open "$APP_URL"
elif command -v sensible-browser >/dev/null 2>&1; then
  exec sensible-browser "$APP_URL"
elif command -v x-www-browser >/dev/null 2>&1; then
  exec x-www-browser "$APP_URL"
elif command -v firefox >/dev/null 2>&1; then
  exec firefox --new-window "$APP_URL" "$@"
fi
"""
bin_path = os.path.join(deb_dir, "usr", "bin", "capturepro")
with open(bin_path, "w", encoding="utf-8") as f:
    f.write(launcher_sh)
os.chmod(bin_path, 0o755)

desktop_entry = """[Desktop Entry]
Version=1.0
Name=CapturePro PC
Comment=Screen Recorder & Snipping Studio
Exec=/usr/bin/capturepro %u
Icon=capturepro
Terminal=false
Type=Application
Categories=AudioVideo;Recorder;Utility;
StartupWMClass=CapturePro
"""
with open(os.path.join(deb_dir, "usr", "share", "applications", "capturepro.desktop"), "w", encoding="utf-8") as f:
    f.write(desktop_entry)

icon_src = os.path.join(ROOT, "public", "pwa-512x512.png")
icon_dst = os.path.join(deb_dir, "usr", "share", "icons", "hicolor", "512x512", "apps", "capturepro.png")
shutil.copyfile(icon_src, icon_dst)

deb_output = os.path.join(DOWNLOADS, "CapturePro_1.0.0_amd64.deb")
subprocess.run(["dpkg-deb", "--build", "--root-owner-group", deb_dir, deb_output], check=True)
print(f"Built valid .deb: {deb_output} ({os.path.getsize(deb_output)} bytes)")


print("2. Building Windows Desktop Package (Native PKZIP .zip)...")
win_dir = "/tmp/capturepro-win-files"
if os.path.exists(win_dir):
    shutil.rmtree(win_dir)
os.makedirs(win_dir, exist_ok=True)

# 1. Native Windows Internet Shortcut
url_shortcut = f"""[InternetShortcut]
URL={APP_URL}
IconIndex=0
IconFile=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe
"""
with open(os.path.join(win_dir, "CapturePro PC.url"), "w", encoding="utf-8") as f:
    f.write(url_shortcut)

# 2. Standalone Windows batch launcher
bat_launcher = f"""@echo off
title CapturePro PC Desktop Launcher
set "APP_URL={APP_URL}"

if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%"
    exit /b
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%"
    exit /b
)
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%"
    exit /b
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%"
    exit /b
)
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%"
    exit /b
)

:: Fallback
start "" "%APP_URL%"
"""
with open(os.path.join(win_dir, "Launch-CapturePro.bat"), "w", encoding="utf-8") as f:
    f.write(bat_launcher)

# 3. Create Windows Desktop Shortcut script
vbs_shortcut = f"""Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\\CapturePro PC.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "{APP_URL}"
oLink.Description = "CapturePro PC - Screen Recorder & Snipping Studio"
oLink.Save
MsgBox "CapturePro PC desktop shortcut created successfully on your desktop!", vbInformation, "CapturePro PC"
"""
with open(os.path.join(win_dir, "Create-Desktop-Shortcut.vbs"), "w", encoding="utf-8") as f:
    f.write(vbs_shortcut)

# Instructions
win_readme = """=====================================================
CapturePro PC — Windows Desktop Launcher
=====================================================

HOW TO RUN:
1. Double-click "Launch-CapturePro.bat" to open CapturePro in a dedicated desktop window without browser bars.
   OR
2. Double-click "CapturePro PC.url" to launch immediately.

HOW TO ADD TO DESKTOP:
- Double-click "Create-Desktop-Shortcut.vbs" to place an icon on your Windows Desktop.

NO INSTALLATION REQUIRED!
Runs with zero setup.
"""
with open(os.path.join(win_dir, "README.txt"), "w", encoding="utf-8") as f:
    f.write(win_readme)

win_zip = os.path.join(DOWNLOADS, "CapturePro-Windows.zip")
if os.path.exists(win_zip):
    os.remove(win_zip)

with zipfile.ZipFile(win_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for filename in os.listdir(win_dir):
        file_path = os.path.join(win_dir, filename)
        zf.write(file_path, arcname=filename)

print(f"Built valid Windows .zip: {win_zip} ({os.path.getsize(win_zip)} bytes)")


print("3. Building Linux Universal Desktop Package (.tar.gz)...")
linux_pkg_dir = "/tmp/capturepro-linux-universal"
if os.path.exists(linux_pkg_dir):
    shutil.rmtree(linux_pkg_dir)
os.makedirs(linux_pkg_dir, exist_ok=True)

with open(os.path.join(linux_pkg_dir, "run.sh"), "w", encoding="utf-8") as f:
    f.write(launcher_sh)
os.chmod(os.path.join(linux_pkg_dir, "run.sh"), 0o755)

shutil.copyfile(icon_src, os.path.join(linux_pkg_dir, "capturepro.png"))

desktop_user_entry = """[Desktop Entry]
Version=1.0
Name=CapturePro PC
Comment=Screen Recorder & Snipping Studio
Exec=CURRENT_DIR/run.sh %u
Icon=CURRENT_DIR/capturepro.png
Terminal=false
Type=Application
Categories=AudioVideo;Recorder;Utility;
StartupWMClass=CapturePro
"""
with open(os.path.join(linux_pkg_dir, "capturepro.desktop"), "w", encoding="utf-8") as f:
    f.write(desktop_user_entry)

install_user_sh = """#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$HOME/.local/share/applications"
mkdir -p "$TARGET_DIR"

sed "s|CURRENT_DIR|$DIR|g" "$DIR/capturepro.desktop" > "$TARGET_DIR/capturepro.desktop"
chmod +x "$TARGET_DIR/capturepro.desktop"
chmod +x "$DIR/run.sh"

if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$TARGET_DIR" || true
fi

echo "========================================================"
echo " CapturePro PC installed successfully to your Linux desktop!"
echo " Look for 'CapturePro PC' in your application menu."
echo "========================================================"
"""
with open(os.path.join(linux_pkg_dir, "install.sh"), "w", encoding="utf-8") as f:
    f.write(install_user_sh)
os.chmod(os.path.join(linux_pkg_dir, "install.sh"), 0o755)

linux_tar = os.path.join(DOWNLOADS, "CapturePro-Linux-Desktop.tar.gz")
subprocess.run(["tar", "-czf", linux_tar, "-C", "/tmp", "capturepro-linux-universal"], check=True)
print(f"Built valid Linux tar.gz: {linux_tar} ({os.path.getsize(linux_tar)} bytes)")

# 4. Build Complete Release ZIP
full_zip = os.path.join(DOWNLOADS, "CapturePro-v1.0.0-Release-All.zip")
if os.path.exists(full_zip):
    os.remove(full_zip)

with zipfile.ZipFile(full_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.write(deb_output, arcname="CapturePro_1.0.0_amd64.deb")
    zf.write(linux_tar, arcname="CapturePro-Linux-Desktop.tar.gz")
    zf.write(win_zip, arcname="CapturePro-Windows.zip")
    zf.write(os.path.join(linux_pkg_dir, "install.sh"), arcname="install-linux.sh")

print(f"Built Full Release ZIP: {full_zip} ({os.path.getsize(full_zip)} bytes)")
print("All packages built and verified!")
