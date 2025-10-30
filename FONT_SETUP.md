# Gilroy Font Setup Instructions

This project uses the **Gilroy** font family hosted locally for better performance and reliability.

## Current Status

✅ Font CSS configuration is ready
✅ Font directory structure created
⏳ **ACTION REQUIRED**: Font files need to be added

## Quick Setup

### Step 1: Download Gilroy Font Files

Download the Gilroy font files from one of these sources:

1. **Original Gist** (recommended):
   - Visit: https://gist.github.com/mfd/09b70eb47474836f25a21660282ce0fd
   - Download the raw font files (woff2, woff, ttf formats)

2. **Alternative**: Use your licensed font provider

### Step 2: Place Font Files

Place the downloaded font files in the following directory:
```
public/fonts/gilroy/
```

### Required Files:

#### Essential (must have):
- `Gilroy-Regular.woff2` / `.woff` / `.ttf` (font-weight: 400)
- `Gilroy-Medium.woff2` / `.woff` / `.ttf` (font-weight: 500)
- `Gilroy-SemiBold.woff2` / `.woff` / `.ttf` (font-weight: 600)
- `Gilroy-Bold.woff2` / `.woff` / `.ttf` (font-weight: 700)

#### Optional (recommended for full support):
- `Gilroy-Light.woff2` / `.woff` / `.ttf` (font-weight: 300)
- `Gilroy-ExtraBold.woff2` / `.woff` / `.ttf` (font-weight: 800)

### Step 3: Verify Setup

After adding the font files, your directory structure should look like:

```
public/
├── fonts/
│   ├── gilroy.css
│   └── gilroy/
│       ├── README.md
│       ├── Gilroy-Light.woff2
│       ├── Gilroy-Light.woff
│       ├── Gilroy-Light.ttf
│       ├── Gilroy-Regular.woff2
│       ├── Gilroy-Regular.woff
│       ├── Gilroy-Regular.ttf
│       ├── Gilroy-Medium.woff2
│       ├── Gilroy-Medium.woff
│       ├── Gilroy-Medium.ttf
│       ├── Gilroy-SemiBold.woff2
│       ├── Gilroy-SemiBold.woff
│       ├── Gilroy-SemiBold.ttf
│       ├── Gilroy-Bold.woff2
│       ├── Gilroy-Bold.woff
│       ├── Gilroy-Bold.ttf
│       ├── Gilroy-ExtraBold.woff2
│       ├── Gilroy-ExtraBold.woff
│       └── Gilroy-ExtraBold.ttf
└── NQD_logo.png
```

### Step 4: Test

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Open DevTools (F12) → Network tab → Filter by "Font"

4. You should see the Gilroy font files loading from `/fonts/gilroy/`

5. Check that text renders in Gilroy font (use DevTools → Elements → Computed styles)

## Troubleshooting

### Font Not Loading?

1. **Check file paths**: Ensure font files are in `public/fonts/gilroy/` (not `public/fonts/`)
2. **Check file names**: Ensure exact naming matches the CSS (case-sensitive)
3. **Clear cache**: Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check console**: Look for 404 errors in browser console
5. **Restart dev server**: Stop and restart `npm run dev`

### Font File Format Priority

The application will try to load fonts in this order:
1. **WOFF2** (best compression, modern browsers)
2. **WOFF** (good compression, older browsers)
3. **TTF** (universal fallback)

You can include just WOFF2 for modern browsers, but including all three ensures maximum compatibility.

### Missing Font Files

If you don't add the font files, the application will fall back to system fonts:
```
-apple-system → BlinkMacSystemFont → Segoe UI → Roboto → sans-serif
```

The site will still work, but won't have the custom Gilroy typography.

## Font License

⚠️ **Important**: Ensure you have proper licensing for the Gilroy font family before using it in production.

- Check the license terms for the specific weights you're using
- Some Gilroy variants may be free for personal use only
- Commercial use may require a license

## Where Fonts Are Used

The Gilroy font is applied globally across:

- ✅ All page content (via global CSS in `_app.js`)
- ✅ ChatBox component (all text, buttons, inputs)
- ✅ Privacy Policy page
- ✅ Terms of Service page
- ✅ All headings and paragraphs
- ✅ Form inputs and buttons

## Technical Details

**Font CSS Location**: `public/fonts/gilroy.css`
**Font Files Location**: `public/fonts/gilroy/`
**Loaded In**: `pages/_app.js`
**Font Display Strategy**: `swap` (shows fallback font immediately, swaps when custom font loads)

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify file paths and naming
3. Ensure font files are in the correct format
4. Try clearing Next.js cache: `rm -rf .next`

---

**Last Updated**: 2025-10-30
