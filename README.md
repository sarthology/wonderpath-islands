# WonderPath Islands

Static site repository for the 22 approved WonderPath islands. No build dependencies are required.

## Source status

The approved standalone HTML has not yet been supplied to this checkout. Asset extraction, interaction verification, and the site entry point are pending that source file.

## Local preview

Once `public/index.html` is present, run:

```sh
python3 -m http.server 8000 --directory public
```

Open http://localhost:8000.

## Vercel

Import the private GitHub repository with the repository root as the Root Directory. The tracked `vercel.json` selects no framework, disables installation and build commands, and serves `public/`.

## Required behavior

- Horizontal scrolling and swiping change islands.
- Vertical scrolling and swiping zoom.
- Mobile pinch gestures zoom.
- Preserve all 22 approved islands, artwork, parallax, independently moving rocks, and navigation.
- Preserve responsive layout and reduced-motion support.
