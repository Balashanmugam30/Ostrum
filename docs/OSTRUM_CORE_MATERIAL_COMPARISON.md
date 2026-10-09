# Ostrum Core — 3D Material Design & Variation Comparison

This document provides a comparative analysis of the three art-directed material treatments engineered for the Monyédre 360 Möbius sculpture at `/preview/ostrum-core`.

---

## 1. Visual Comparison Matrix

| Property | Variation A: Ostrum Pearl | Variation B: Crimson Porcelain | Variation C: Sculptural Satin |
| :--- | :--- | :--- | :--- |
| **Material Base** | Warm Alabaster Porcelain (`#f6f0e4`) | Blush Porcelain White (`#f7eee8`) | Warm Sandstone Ivory (`#ede3d4`) |
| **Finish & Specular** | Satin Sheen (`roughness: 0.34`) | Polished Ceramic (`roughness: 0.26`) | Honed Matte Stone (`roughness: 0.46`) |
| **Clearcoat Glaze** | Moderate (`clearcoat: 0.40`) | High Glass Glaze (`clearcoat: 0.58`) | Low Matte Wax (`clearcoat: 0.15`) |
| **Transmission Depth** | Gentle Diffusion (`0.22`, `thick: 1.1`) | Controlled Glow (`0.18`, `thick: 0.95`)| Solid Density (`0.08`, `thick: 0.6`) |
| **Sheen & Falloff** | Champagne grazing (`#fcecd4`) | Crimson/Blush scatter (`#ff755d`) | Sandstone edge (`#eedbc2`) |
| **Iridescence Lustre**| Subtle (`0.05`, IOR `1.30`) | Mother-of-pearl (`0.16`, IOR `1.36`) | Very low (`0.02`, IOR `1.25`) |
| **Key Studio Light** | Warm Champagne (`#fff7ee`, 2.2) | Soft Warm Light (`#fff5ed`, 2.3) | Neutral Warm Key (`#fff2e2`, 2.1) |
| **Rim Separation** | Restrained Red (`#ff4d30`, 1.8) | Rich Crimson (`#ff3b20`, 2.4) | Champagne Rim (`#ff5a3c`, 1.5) |
| **Ambient Ground Bounce**| Deep Maroon (`#220404`, 0.95) | Crimson Atmosphere (`#360505`, 1.1) | Dark Umber (`#1c0303`, 0.88) |
| **Surface Texture** | Procedural Micro-Noise Canvas | Procedural Micro-Noise Canvas | Procedural Micro-Noise Canvas |

---

## 2. Deep Dive: The Three Variations

### Variation A — Ostrum Pearl
- **Intended Character**: Architectural, elegant, and timeless gallery porcelain.
- **Visual Behavior**: Reads with crisp alabaster clarity against the crimson environment. The surface absorbs and softens light with fine satin highlights, avoiding high-gloss plastic sheen.
- **Strengths**: 
  - Maximum legibility and silhouette clarity across all viewing angles.
  - Neutral warm-white tone complements white typography without competing for attention.
  - Highly timeless; feels like an architectural physical maquette.
- **Weaknesses**:
  - Slightly less chromatic integration with the caustic fiery environment compared to Variation B.

---

### Variation B — Crimson Porcelain *(Recommended)*
- **Intended Character**: The most recognisably Ostrum-themed variation; designed specifically to live inside the crimson caustics.
- **Visual Behavior**: Uses a pearl-white core body with muted blush and crimson grazing angle reflections (`sheen: 0.65`, `sheenColor: #ff755d`). The polished ceramic glaze (`clearcoat: 0.58`) catches subtle rim reflections from the red world while retaining crisp ivory definition in direct light.
- **Strengths**:
  - Exceptional contextual harmony with the crimson caustics background.
  - Does NOT look like a generic white model pasted on top of a red background; it feels physically bathed in the environment's light.
  - Mother-of-pearl lustre adds refined luxury and depth.
  - Zero sci-fi glowing orb feel; light response is purely physical and photographic.
- **Weaknesses**:
  - Requires precise lighting calibration (already tuned) so that grazing crimson tones do not overpower white typography contrast.

---

### Variation C — Sculptural Satin
- **Intended Character**: Understated, tactile, and gallery-quality stone/wax honesty.
- **Visual Behavior**: Warmer sandstone and limestone undertone with a higher roughness (`0.46`) and lower clearcoat. Reflects diffuse, muted ambient light.
- **Strengths**:
  - Very calm, organic, and grounded; zero artificial gloss.
  - Micro-surface roughness texture is most noticeable here, giving tangible physical weight.
- **Weaknesses**:
  - Slightly lower tonal separation against mid-dark areas of the crimson background.
  - Less dramatic and cinematic than Variation B.

---

## 3. Side-by-Side Visual Proof

The composite rendering comparing all three variations at Front View ($0^\circ$) is archived at:
- `rebuild-capture/ostrum-core-materials/side-by-side-comparison.png`

Individual multi-angle and close-up captures are available under:
- `rebuild-capture/ostrum-core-materials/var-a-*`
- `rebuild-capture/ostrum-core-materials/var-b-*`
- `rebuild-capture/ostrum-core-materials/var-c-*`

---

## 4. Recommendation & Rationale

**Recommendation:** **Variation B — Crimson Porcelain**

### Why Variation B fits Ostrum best:
1. **True Environmental Belonging**: The blush and crimson rim reflections (`#ff755d` / `#ff3b20`) visually root the sculpture directly into Ostrum's signature caustic atmosphere.
2. **Distinctive Brand Motif**: Unlike Variation A (which could belong to any luxury architecture studio) or Variation C (which reads as neutral stone), Variation B is distinctly Ostrum: a radiant, polished ceramic sculpture catching the warmth of our fiery crimson world.
3. **Photographic & Tactile**: By eliminating the glowing central orb and replacing it with physical glaze, clearcoat, and directional key-to-rim lighting, the model feels like a high-end physical art piece photographed on a studio stage.
