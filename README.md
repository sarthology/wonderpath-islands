# WonderPath Islands

Twenty-two approved floating islands with responsive artwork, parallax clouds and scenery, independently moving rocks, and island navigation.

Plain HTML, CSS, and JavaScript. No package installation, framework, or build step.

## Run locally

```sh
python3 -m http.server 3000 --directory public
```

Open http://localhost:3000.

## Files

- `public/index.html`: island content, accessible artwork descriptions, and responsive image sources.
- `public/assets/layout.css`: original layout, typography, backgrounds, and breakpoints.
- `public/assets/scene.css`: layered motion, zoom, and phone composition.
- `public/assets/scene.js`: navigation, wheel/swipe/pinch zoom, parallax, and independent rocks.
- `public/assets/`: all supplied WebP and SVG artwork, copied without modification.
- `asset-manifest.json`: supplied artwork provenance metadata. The PNG masters it references were not included in the supplied ZIP; the display WebP files are included.

## Controls

- Horizontal trackpad scrolling, Shift + wheel, or a horizontal drag/swipe changes islands.
- Vertical scrolling or swiping zooms the current island.
- A two-finger pinch zooms on touch devices.
- Focus the island scene with Tab. Left/Right navigate; Home/End go to the first/last island.
- Plus/Minus or Up/Down zoom; 0 resets zoom.

Zoom is remembered separately for each island and limited to 75–170%. Reduced-motion preferences disable ambient motion and smooth island transitions; changes to the preference take effect while the page is open.

## GitHub Pages

The source lives on `main`; the `gh-pages` branch contains only the contents of `public/`. GitHub Pages publishes from the root of `gh-pages`, with `.nojekyll` disabling Jekyll processing. No build dependencies, secrets, or environment variables are required.

After committing changes on `main`, publish them with:

```sh
git push origin main
git subtree push --prefix public origin gh-pages
```

In repository Settings → Pages, select Deploy from a branch → `gh-pages` → `/ (root)`.

All asset URLs are relative, so the site works under `/wonderpath-islands/`. GitHub Pages sites are publicly viewable; keeping the source repository private requires a plan that supports Pages for private repositories.

## Optional Vercel deployment

The retained `vercel.json` also supports Vercel: import the repository root, use no framework, and serve `public/`. Installation and build commands are empty.

## Source

Imported from the supplied `WonderPath-Project.zip`. The layout stylesheet was extracted from the HTML and paths were adjusted for its new location. HTML, CSS, and JavaScript were formatted for readability. The artwork and island text remain unchanged. The zoom readout now updates for pinch gestures and keyboard reset, each island restores its own zoom, and reduced-motion changes are observed live. A short-landscape layout keeps artwork visible on phones and tablets.
