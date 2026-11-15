# WonderPath Islands

Twenty-two approved floating islands with responsive artwork, parallax clouds and scenery, independently moving rocks, and island navigation.

Plain HTML, CSS, and JavaScript. No package installation, framework, or build step.

## Run locally

```sh
python3 -m http.server 3000 --directory public
```

Open http://localhost:3000 for the original horizontal experience.

Open http://localhost:3000/vertical.html for the vertical journey: all 22 islands
are stacked one below another. Scroll or swipe up/down to explore; clouds,
rocks, and island parallax animate in both directions. The on-screen arrows
navigate between islands. Use the zoom controls to inspect each island and
Reset view to return to its overview. Zoom is remembered per island.

With the scene focused, Up/Down or Page Up/Page Down navigate, Home/End jump
to the first/last island, and Plus/Minus/0 control zoom. Reduced-motion settings
remove ambient and scroll-driven motion. The Original view link returns to the
root page. This separate page uses `assets/vertical.css` and `assets/vertical.js`;
the original page and its assets are unchanged.

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

Zoom is remembered separately for each island and ranges from 75% to 320%. Close-ups hide the sector copy and use the entire viewport. Reset or zoom back out to restore the overview text. Move the pointer to inspect on desktop; drag with one finger to pan on touch devices. Pinch to zoom; after lifting one finger, continue panning with the other. Reset view returns to 100%. Reduced-motion preferences disable ambient motion and smooth island transitions; changes to the preference take effect while the page is open.

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

The large repeated Faceted Adventure heading and Island Worlds draft label have been removed. Each island uses its sector title as the heading. The overview keeps the complete island visible. Zooming past 130% hides the copy and expands the artwork stage to the full viewport, while preserving mouse and two-finger camera panning. Approved island artwork remains unchanged.

## Cloud depth and fantasy background

The generated fantasy sky fills the viewport. Three atmospheric clouds and two foreground cloud image planes per island move at separate depths; the near clouds cross the island base. The six decorative rocks per island retain independent motion. Foreground clouds do not intercept input. Reduced motion disables ambient cloud and rock movement while retaining zoom and explicit touch camera panning.

New assets: `public/assets/fantasy-sky.png` and `public/assets/foreground-cloud.png`. Generated with the built-in imagegen tool; the foreground cloud retains transparency. Generation prompts are in `ASSET-PROMPTS.md`. Approved island artwork remains unchanged.

Clouds respond to camera zoom at different depth factors: distant sky expands slightly, atmospheric clouds expand moderately, and foreground clouds expand and shift most strongly. Zooming out reverses the effect.

The overview copy fades out over 360 ms and returns over 420 ms. Artwork and foreground clouds ease between overview and full-page positions over 520 ms; camera transforms remain independent so mouse panning stays live. Reduced-motion mode skips these transitions.

At overview zoom, pointer movement anywhere across the page moves and subtly tilts the complete island. Clouds and rocks retain separate depth motion. This overview effect fades into the existing close-up pan as zoom increases and is disabled by reduced-motion preferences.

In close-up, one-finger touch or pen dragging pans the image rather than changing islands or zooming. Overview swipes still navigate and zoom. The reset control uses a forest-green and gold pill, an illustrated return icon, a desktop shortcut hint, and a 52px touch target.

## Approved island comparisons

Production comparison: https://sarthology.github.io/wonderpath-islands/vertical.html

Eighteen approved redesigns are available alongside their originals. The remaining
four sectors retain their original artwork.

The vertical page compares each approved redesign (right) with its original
(left), in equal-size artwork areas. All 22 sectors keep their original order.

| Sector | Comparison |
| --- | --- |
| 01 — Space Economy | [Open](http://localhost:3000/vertical.html) |
| 03 — Future of Work & Emerging Industries | [Open](http://localhost:3000/vertical.html#future-work-emerging-industries) |
| 04 — Government & Public Services | [Open](http://localhost:3000/vertical.html#government-public-services) |
| 05 — Construction & Real Estate | [Open](http://localhost:3000/vertical.html#construction-real-estate) |
| 07 — Transportation, Mobility & Logistics | [Open](http://localhost:3000/vertical.html#transportation-mobility-logistics) |
| 08 — Wellness, Fitness & Sports | [Open](http://localhost:3000/vertical.html#wellness-fitness-sports) |
| 09 — Financial Services | [Open](http://localhost:3000/vertical.html#financial-services) |
| 10 — Technology | [Open](http://localhost:3000/vertical.html#technology) |
| 12 — Education | [Open](http://localhost:3000/vertical.html#education) |
| 13 — Manufacturing & Industrial | [Open](http://localhost:3000/vertical.html#manufacturing-industrial) |
| 14 — Healthcare & Life Sciences | [Open](http://localhost:3000/vertical.html#healthcare) |
| 15 — Consumer, Retail & Commerce | [Open](http://localhost:3000/vertical.html#consumer-retail-commerce) |
| 17 — Defense, Security & Public Protection | [Open](http://localhost:3000/vertical.html#defense-security-public-protection) |
| 18 — Agriculture, Food & Natural Resources | [Open](http://localhost:3000/vertical.html#agriculture) |
| 19 — Professional & Business Services | [Open](http://localhost:3000/vertical.html#professional-business-services) |
| 20 — Clean Tech / Energy, Climate & Environment | [Open](http://localhost:3000/vertical.html#energy-climate-environment) |
| 21 — Nonprofit, Social Impact & Philanthropy | [Open](http://localhost:3000/vertical.html#nonprofit-social-impact-philanthropy) |
| 22 — Media, Entertainment & Creative | [Open](http://localhost:3000/vertical.html#media-entertainment-creative) |

Hover or select a version, then scroll up over its artwork to zoom in and scroll
down to zoom out. On touch screens, select the version and pinch or use the
zoom controls. Above 130%, the selected version expands while the other version
and sector copy fade out. Reset view restores the comparison. Each version
remembers its own zoom. The header, margins, navigation arrows, and keyboard
remain available to move between the 22 islands. Scrolling down past the minimum
zoom also resumes vertical navigation. Reduced motion skips transitions.

Approved PNG masters are preserved byte-for-byte in `public/assets/`, with
alpha-preserving WebP versions for display. Their paths, source images and
checksums are recorded under `redesigns` in `asset-manifest.json`. Other islands
keep their existing artwork. The root page and its styles and script are unchanged.
