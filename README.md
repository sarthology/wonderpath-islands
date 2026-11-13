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
- `public/assets/scene.css`: layered motion and interaction styling.
- `public/assets/presentation.css`: final responsive composition and atmospheric background.
- `public/assets/atmospheric-world.svg`: original layered scenery, with distant faceted mesas, floating islands, clouds, and sunset haze.
- `public/assets/scene.js`: navigation, wheel/swipe/pinch zoom, parallax, and independent rocks.
- `public/assets/`: all supplied WebP and SVG artwork, copied without modification.
- `asset-manifest.json`: supplied artwork provenance metadata. The PNG masters it references were not included in the supplied ZIP; the display WebP files are included.

## Controls

- Horizontal trackpad scrolling, Shift + wheel, or a horizontal drag/swipe changes islands.
- Vertical scrolling or swiping zooms the current island.
- A two-finger pinch zooms on touch devices.
- Focus the island scene with Tab. Left/Right navigate; Home/End go to the first/last island.
- Plus/Minus or Up/Down zoom; 0 resets zoom.

Zoom is remembered separately for each island and ranges from 75% to 320%. Close-ups use a softly feathered viewing area beside the copy. Move the pointer to inspect on desktop; use a two-finger drag to pan on touch devices. Reset view returns to 100%. Reduced-motion preferences disable ambient motion and smooth island transitions; changes to the preference take effect while the page is open.

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

## Final presentation

The large repeated Faceted Adventure heading and Island Worlds draft label have been removed. Each island uses its sector title as the heading. The overview keeps the complete island visible. Zooming past 130% opens a close-up with softly feathered edges, allowing details to fill the scene while the copy remains separate. Approved island artwork remains unchanged.

## Cloud depth and fantasy background

The generated fantasy sky fills the viewport. Three atmospheric clouds and two foreground cloud image planes per island move at separate depths; the near clouds cross the island base. The six decorative rocks per island retain independent motion. Foreground clouds do not intercept input. Reduced motion disables ambient cloud and rock movement while retaining zoom and explicit two-finger camera panning.

New assets: `public/assets/fantasy-sky.png` and `public/assets/foreground-cloud.png`. Generated with the built-in imagegen tool; the foreground cloud retains transparency. Generation prompts are in `ASSET-PROMPTS.md`. Approved island artwork remains unchanged.
