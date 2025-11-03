# Fotion Release Guide

This guide explains how to create a new release for Fotion using GitHub Actions.

## Automated Release Process

Fotion uses GitHub Actions to automatically build and publish releases for macOS, Windows, and Linux.

## Creating a New Release

### 1. Update Version Number

Update the version in `package.json`:

```bash
# Edit version manually or use npm version command
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.1 -> 0.2.0
npm version major  # 0.2.0 -> 1.0.0
```

### 2. Commit Changes

```bash
git add package.json
git commit -m "chore: bump version to v0.1.1"
```

### 3. Create and Push Git Tag

```bash
# Create a tag (must start with 'v')
git tag v0.1.1

# Push the tag to GitHub
git push origin v0.1.1
```

### 4. Automated Build Process

Once you push the tag, GitHub Actions will automatically:

1. **Build for all platforms**:
   - macOS: `.dmg` and `.zip` files
   - Windows: `.exe` installer and portable version
   - Linux: `.AppImage` and `.deb` packages

2. **Create GitHub Release**:
   - Draft a new release with the tag name
   - Upload all build artifacts
   - Generate release notes from commits

3. **Publish Release**:
   - The release will be public immediately
   - Users can download installers from the Releases page

### 5. Access the Release

After the workflow completes (usually 10-20 minutes), visit:

```
https://github.com/FotionOrg/Fotion/releases
```

## Release Workflow Details

The release workflow (`.github/workflows/release.yml`) does the following:

- **Triggers**: Runs when a tag matching `v*` is pushed
- **Platforms**: Builds on macOS, Windows, and Linux runners
- **Artifacts**: All build outputs are uploaded as release assets
- **Permissions**: Uses `GITHUB_TOKEN` (no manual setup needed)

## Manual Release (Alternative)

If you prefer to release manually:

### Build Locally

```bash
# Build for your current platform
pnpm electron:build

# Or build for specific platforms
pnpm electron:build:mac     # macOS
pnpm electron:build:win     # Windows
pnpm electron:build:linux   # Linux
```

### Create Release on GitHub

1. Go to: https://github.com/FotionOrg/Fotion/releases/new
2. Create a new tag (e.g., `v0.1.1`)
3. Write release notes
4. Upload files from `dist/` folder:
   - `Fotion-*.dmg` (macOS installer)
   - `Fotion-*.zip` (macOS portable)
   - `Fotion-Setup-*.exe` (Windows installer)
   - `Fotion-*.AppImage` (Linux)
   - `Fotion-*.deb` (Linux Debian/Ubuntu)
5. Click "Publish release"

## Version Naming Convention

Follow semantic versioning:

- **Major (v1.0.0)**: Breaking changes
- **Minor (v0.2.0)**: New features, backward compatible
- **Patch (v0.1.1)**: Bug fixes, backward compatible

Examples:
- `v0.1.0` - Initial release
- `v0.1.1` - Bug fix release
- `v0.2.0` - New feature release
- `v1.0.0` - First stable release

## Troubleshooting

### Build Fails on CI

- Check the Actions tab: https://github.com/FotionOrg/Fotion/actions
- Look at the error logs for specific platform builds
- Common issues:
  - Missing dependencies
  - TypeScript errors
  - Build assets not found

### Release Not Created

- Ensure tag starts with `v` (e.g., `v0.1.1`, not `0.1.1`)
- Check repository permissions (Actions must have write access)
- Verify `GITHUB_TOKEN` has correct permissions

### Download Links Don't Work

- Wait for the workflow to complete (check Actions tab)
- Ensure release is published (not draft)
- Try direct download link format:
  ```
  https://github.com/FotionOrg/Fotion/releases/download/v0.1.1/Fotion-0.1.1.dmg
  ```

## Installation Instructions for Users

### macOS

1. Download `Fotion-*.dmg` from Releases page
2. Open the DMG file
3. Drag Fotion to Applications folder
4. If "unidentified developer" warning appears:
   - Right-click the app
   - Select "Open"
   - Click "Open" in the dialog

### Windows

1. Download `Fotion-Setup-*.exe` from Releases page
2. Run the installer
3. Follow installation wizard
4. Windows Defender may show a warning (click "More info" → "Run anyway")

### Linux

**AppImage (recommended):**
```bash
# Download AppImage
wget https://github.com/FotionOrg/Fotion/releases/download/v0.1.1/Fotion-*.AppImage

# Make executable
chmod +x Fotion-*.AppImage

# Run
./Fotion-*.AppImage
```

**Debian/Ubuntu (.deb):**
```bash
# Download and install
wget https://github.com/FotionOrg/Fotion/releases/download/v0.1.1/Fotion-*.deb
sudo dpkg -i Fotion-*.deb
```

## Code Signing (Future)

Currently, releases are not code-signed. This means:

- **macOS**: Users will see "unidentified developer" warning
- **Windows**: SmartScreen may show a warning

To add code signing in the future:

1. Get Apple Developer account ($99/year) for macOS
2. Get code signing certificate for Windows
3. Add secrets to GitHub repository:
   - `CSC_LINK` (certificate file)
   - `CSC_KEY_PASSWORD` (certificate password)
4. Update workflow to use certificates

## Next Steps

After releasing:

1. Announce the release (Twitter, Discord, etc.)
2. Update documentation if needed
3. Monitor GitHub Issues for bug reports
4. Plan next release features
