#!/bin/bash
echo "Installing CapturePro PC desktop application..."
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons"
mkdir -p "$DESKTOP_DIR" "$ICON_DIR"

DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$DIR/icon.png" "$ICON_DIR/capturepro.png"

cat <<EOF > "$DESKTOP_DIR/capturepro.desktop"
[Desktop Entry]
Name=CapturePro PC
Comment=Screen Recorder & Snipping Studio
Exec=$DIR/run.sh
Icon=$ICON_DIR/capturepro.png
Terminal=false
Type=Application
Categories=AudioVideo;Recorder;Utility;
StartupWMClass=CapturePro
EOF

chmod +x "$DESKTOP_DIR/capturepro.desktop"
echo "Success! CapturePro PC is now installed in your Linux application menu."
