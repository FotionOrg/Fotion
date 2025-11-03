# Fotion Desktop App Downloads

This directory contains the Electron desktop app builds for Fotion.

## Directory Structure

```
public/downloads/
├── latest.json           # Version info and download links
├── README.md            # This file
├── Fotion-1.0.0-mac.dmg # macOS installer (Universal)
├── Fotion-1.0.0-mac.zip # macOS portable
├── Fotion-Setup-1.0.0.exe # Windows installer
├── Fotion-1.0.0-portable.exe # Windows portable
├── Fotion-1.0.0.AppImage # Linux AppImage
└── fotion_1.0.0_amd64.deb # Debian/Ubuntu package
```

## Building the Apps

### macOS
```bash
pnpm electron:build:mac
```
Output: `dist/Fotion-{version}.dmg` and `dist/Fotion-{version}-mac.zip`

### Windows
```bash
pnpm electron:build:win
```
Output: `dist/Fotion Setup {version}.exe` and `dist/Fotion {version}.exe` (portable)

### Linux
```bash
pnpm electron:build:linux
```
Output: `dist/Fotion-{version}.AppImage` and `dist/fotion_{version}_amd64.deb`

## After Building

1. Copy the built files from `dist/` to `public/downloads/`
2. Rename files to match the naming convention in `latest.json`
3. Update `latest.json` with new version info
4. Commit and push to repository
5. Deploy (files will be served from `/downloads/` path)

## Version Update Checklist

- [ ] Update `version` in `latest.json`
- [ ] Update `releaseDate` in `latest.json`
- [ ] Update `releaseNotes` in `latest.json`
- [ ] Update file `url` paths with new version
- [ ] Update file `size` (run `ls -lh` to check)
- [ ] Test download links after deployment
- [ ] Update ELECTRON.md if needed

## File Size Guidelines

Run this to get file sizes:
```bash
cd dist
ls -lh | grep -E "\.(dmg|zip|exe|AppImage|deb)$"
```

## Hosting Options

### Option 1: GitHub Releases (Recommended)
- Create a new release tag (e.g., `v1.0.0`)
- Upload built files as release assets
- Update `latest.json` URLs to GitHub release URLs
- Example: `https://github.com/YourOrg/Fotion/releases/download/v1.0.0/Fotion-1.0.0-mac.dmg`

### Option 2: Static Hosting
- Host files in `public/downloads/` (already set up)
- Files served at `https://yourdomain.com/downloads/filename`
- Note: Large files may need CDN or dedicated storage

### Option 3: Cloud Storage
- Upload to AWS S3, Google Cloud Storage, etc.
- Use signed URLs or public URLs
- Update `latest.json` with cloud URLs
