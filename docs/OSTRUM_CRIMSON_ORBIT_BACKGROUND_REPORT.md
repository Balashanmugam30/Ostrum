# Ostrum — Crimson Orbit Background & Sculptural Curios Report

## 1. Executive Summary

This engineering report documents the implementation and verification of the **Crimson Orbit** visual refinement for the Ostrum Selected Work section ([`components/sections/OstrumWorksWheelSection.tsx`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/components/sections/OstrumWorksWheelSection.tsx)).

The previous implementation suffered from three aesthetic and ergonomic defects:
1. **Background Blurry Streaks:** The background contained broad, oversaturated crimson ribbons that dominated negative space and lacked material depth.
2. **Empty Negative Space Around Ring:** In the initial resting ring state (`turn = 0`), the 68–76% viewport height wheel left expansive empty voids on the left and right flanks.
3. **Crude Mouse Interaction:** The pointer interaction previously caused sudden displacement and lacked fluid inertia.

Under the **Crimson Orbit** visual direction, we engineered:
- A high-density WebGL2 fluid shader suspended in deep oxblood space (`#040104`) with multi-scale domain-warped potential fields, controlled ruby contours (`#850B1B`), warm champagne sheen (`#D8C9C5`), fine micro-grain (`0.18`), and edge vignetting (`0.88`).
- A localized cursor-reactive fluid swirl with velocity inertia bounded within a ~48% viewport height radius that settles naturally without whole-screen shifts.
- Six vector-shaded **Sculptural Curios** placed strictly within the outer negative space (3 left, 3 right) that subtly float and exhibit pointer parallax without encroaching on the central catalogue.
- Smooth scroll-bound disappearance as the wheel morphs into the project drum (`turn: 0.0 -> 0.70`), terminating in complete dormancy (`visibility: hidden`, `pointer-events: none`, rAF paused) in Drum mode, with instant and smooth reversibility back to 100% opacity upon upward scroll.
- Zero React re-renders during mouse movement, wheel scrubbing, or floating animations.

---

## 2. Crimson Orbit WebGL2 Shader Architecture

Implemented in [`components/ui/anodized-ink.tsx`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/components/ui/anodized-ink.tsx), the shader replaces coarse sinusoidal bands with a curvilinear fluid potential field.

### 2.1 Mathematical Model
- **Dual Orbital Centers:** Rather than parallel linear bands, the field evaluates two orbital foci ($(-0.25, -0.15)$ and $(0.32, 0.22)$) perturbed by domain-warped fractional Brownian motion (FBM).
- **Localized Mouse Fluid Swirl:** 
  $$\text{dist} = \|\mathbf{uv} - \mathbf{mouse}\|$$
  $$\text{influence} = \text{smoothstep}(0.48, 0.0, \text{dist})$$
  $$\Delta\mathbf{uv} = \left(\mathbf{v}_{\text{tangent}} \cdot 0.08 + \mathbf{v}_{\text{velocity}} \cdot 0.12\right) \times \text{influence}$$
  This restricts cursor disturbance strictly within a 48% radius of the pointer, leaving peripheral composition stable.
- **Controlled Palette Hierarchy:**
  - Base Deep Oxblood: `vec3(0.015, 0.004, 0.015)` (`#040104`)
  - Rich Ruby Contours: `vec3(0.52, 0.043, 0.106)` (`#850B1B`)
  - Warm Champagne Specular: `vec3(0.85, 0.79, 0.77)` (`#D8C9C5`)
  - Core Ostrum Crimson Highlight: `vec3(0.82, 0.0, 0.11)` (`#D1001C`)
- **Corner Vignette:** $V(uv) = 1.0 - \text{smoothstep}(0.42, 1.35, \text{length}(uv)) \times 0.88$, creating dark margins behind peripheral curios.

---

## 3. Sculptural Curios in Empty Side Spaces

Implemented in [`components/ui/works-wheel-curios.tsx`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/components/ui/works-wheel-curios.tsx), the curios are rendered using pure SVG vector graphics with multi-stop radial and linear gradients, simulated caustic glints, and hardware-accelerated transforms. No additional Three.js or WebGL renderers were introduced.

### 3.1 Curio Artefact Inventory
- **Left Negative Space Group:**
  1. *Curio L1 (Upper Left):* **Porcelain Möbius Loop** ($82 \times 74\,\text{px}$) — Alabaster loop with champagne orbital wire and specular highlight.
  2. *Curio L2 (Lower Left):* **Optical Ruby Glass Droplet** ($60 \times 78\,\text{px}$) — Crimson cabochon refraction droplet with caustic core.
  3. *Curio L3 (Mid-Outer Left):* **Elliptical Orbit & Champagne Bead** ($104 \times 56\,\text{px}$) — Inclined orbital ellipse with metallic sphere.
- **Right Negative Space Group:**
  1. *Curio R1 (Upper Right):* **Dual Satellite** ($88 \times 76\,\text{px}$) — Warm ivory orb paired with ruby cabochon companion.
  2. *Curio R2 (Lower Right):* **Champagne Palladium Sphere** ($78 \times 78\,\text{px}$) — Shaded metallic sphere with equatorial wire ring.
  3. *Curio R3 (Mid-Outer Right):* **Optical Star Glints** ($36 \times 36\,\text{px}$) — 4-point ruby and champagne flare glints.

### 3.2 Spatial Boundary Isolation
The placement coordinates guarantee zero collision with the works wheel:
- In a $1440 \times 900$ viewport, the wheel ring spans $X \in [390, 1050]$.
- Left Curios span $X \in [44, 174]$ (minimum margin to wheel: $+216\,\text{px}$).
- Right Curios span $X \in [1252, 1392]$ (minimum margin to wheel: $+202\,\text{px}$).
- Central title label "Selected Work" remains completely unobstructed.

---

## 4. Scroll-Controlled Morph & Reversibility Lifecycle

1. **Resting State ($\text{turn} = 0.0$):** Curios display at full opacity ($1.0$) with gentle organic floating loops (`curioFloatA`, `curioFloatB`, `curioFloatC`) and pointer-responsive parallax ($\pm 14\,\text{px}$).
2. **Scroll Scrubbing Morph ($\text{turn} \in [0.0, 0.65]$):** 
   - Left group drifts outward by $-65 \times \text{exitP}\,\text{px}$.
   - Right group drifts outward by $+65 \times \text{exitP}\,\text{px}$.
   - Both groups scale down from $1.0 \to 0.84$.
   - Opacity continuously drops: $\text{opacity} = 1.0 - (\text{turn} / 0.65)$.
3. **Drum Mode Dormancy ($\text{turn} \ge 0.70$):**
   - Container set to `visibility: "hidden"`, `opacity: "0"`, `pointerEvents: "none"`.
   - Internal `requestAnimationFrame` loop automatically pauses (`animFrame = 0`), consuming 0 CPU/GPU cycles while browsing the 9 projects.
4. **Reverse Scroll Restoration ($\text{turn} \to 0.0$):**
   - The rAF loop automatically awakens when `turn < 0.70`.
   - Opacity instantly and smoothly tracks reverse scroll progress without CSS transition lag.
   - Fully restores to $\ge 0.978$ opacity when reaching resting position.

---

## 5. Automated Verification & Metrics

The comprehensive verification suite [`scripts/verify_crimson_orbit.js`](file:///c:/Users/balashanmugam/OneDrive/Desktop/Ostrum/scripts/verify_crimson_orbit.js) was executed against the optimized Next.js production build:

| Test ID | Metric / Assertion | Result | Observed Value |
|---|---|---|---|
| **Test 1** | Fixed Cinematic Handoff (Beat 05 stationary) | **PASS** | Beat 05 top delta $\le 1\,\text{px}$; Selected Work rose from bottom |
| **Test 2** | Crimson Orbit WebGL2 Shader Canvas | **PASS** | Full bleed $1440 \times 900\,\text{px}$, WebGL2 context active |
| **Test 3** | Ring Catalogue Scale & Center Label | **PASS** | Ring height $= 72.2\%$ of VP (target $68-76\%$), "Selected Work" present, 0 right index |
| **Test 4** | Sculptural Curios Placement in Negative Space | **PASS** | Left: 3 curios, Right: 3 curios; 0 overlap with wheel cards |
| **Test 5** | Pointer Parallax & Fluid Response | **PASS** | Mouse move stirred local fluid without whole-screen pan |
| **Test 6** | Coordinated Scroll Disappearance | **PASS** | Dissolved at $\text{turn}=0.30$ ($0.719$), 100% hidden at $\text{turn}=1.0$ (`hidden`, $0\,\text{opacity}$, `none`) |
| **Test 7** | Drum Two-Column Layout | **PASS** | Large card on right ($44\%$ width), clean left description, 0 duplicate badges |
| **Test 8** | Reversibility (Reverse Scroll Restores Curios) | **PASS** | $\text{turn}=0.0$ restored opacity to $0.978$ ($\ge 0.95$ threshold) |
| **Test 9** | Click vs Drag Separation | **PASS** | Genuine click opened `https://tmraicarcare.com/`; drag did not navigate |
| **Test 10** | Desktop ($1920 \times 1080$) Viewport | **PASS** | 0 overflow, curios present |
| **Test 11** | Desktop ($1440 \times 900$) Viewport | **PASS** | 0 overflow, curios present |
| **Test 12** | Laptop ($1280 \times 800$) Viewport | **PASS** | 0 overflow, curios present |
| **Test 13** | Tablet ($1024 \times 768$) Viewport | **PASS** | 0 overflow, curios present |
| **Test 14** | Mobile ($390 \times 844$) Viewport | **PASS** | 0 overflow, curios present |
| **Test 15** | Mobile ($375 \times 812$) Viewport | **PASS** | 0 overflow, curios present |
| **Test 16** | Console Hygiene & Runtime Errors | **PASS** | 0 console errors, 0 WebGL warnings |

**Audit Summary:**
- **Tests Passed:** 16 / 16 (100%)
- **Tests Failed:** 0
- **Console Errors:** 0

---

## 6. Artifact Inventory
Visual evidence captures stored in the conversation artifacts directory:
- `crimson-orbit-01-ring-resting.png`: Initial resting ring with left and right curios.
- `crimson-orbit-02-pointer-bg-move.png`: Crimson fluid swirl reacting to central pointer.
- `crimson-orbit-03-pointer-curios-left.png`: Left negative space curios responding to mouse hover.
- `crimson-orbit-04-pointer-curios-right.png`: Right negative space curios responding to mouse hover.
- `crimson-orbit-05-curios-bounds-check.png`: Bounding box geometry validation.
- `crimson-orbit-06-morph-early-exit.png`: Expansion at $\text{turn} = 0.30$ showing outward drift and fade.
- `crimson-orbit-07-morph-halfway.png`: Expansion at $\text{turn} = 0.50$.
- `crimson-orbit-08-drum-opened-clean.png`: Full Drum mode with curios 100% hidden.
- `crimson-orbit-09-selected-project.png`: Selected project presentation.
- `crimson-orbit-10-reverse-scroll-restored.png`: Reverse scroll restoring curios to 100% opacity.
- `crimson-orbit-vp-*.png`: Responsive viewport validation across 6 screen configurations.
- `crimson_orbit_audit.json`: Full machine-readable audit report.
