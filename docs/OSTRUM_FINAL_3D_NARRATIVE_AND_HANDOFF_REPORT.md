# Ostrum — Final 3D Journey, Narrative Timing & Dual Cinematic Pauses Report

**Date:** October 18, 2026  
**Status:** Complete & Formally Verified  
**Scope:** Strictly targeted animation timing: two deliberate ~1-second visual holds (Pause 1 before Beat 01, Pause 2 before Selected Work handoff), front-facing resting pose, and seamless section transition.

---

## 1. Executive Summary

This update adds two deliberate, reversible ~1-second cinematic visual pauses to the established scroll-driven sequence without modifying travel paths, sculpture scale, typography styling, or the Selected Work design.

### Core Additions & Validated Behaviors
1. **Pause 1 (Completed Dark Stage Hold):**  
   After both side-by-side text groups exit and the background transitions to full obsidian black with the sculpture centered at its focal scale, the composition holds completely stationary for a ~1-second visual dwell (`600px` on desktop / `450px` on mobile) before the first narrative text begins revealing. During this hold, rotation holds still at `2.0π`, text is 100% hidden, and zero float occurs.
2. **Synchronized 5-Beat Narrative Travel:**  
   Immediately following Pause 1, Beat 01 (*“Make your business work as one.”*) begins its line-by-line reveal, and the sculpture initiates its rotation from `2.0π` in exact synchronization. It completes 1 full revolution across the 5 beats (`2.0π` to `4.0π`).
3. **Pause 2 (Completed Closing Composition Hold):**  
   At the culmination of Beat 05, the sculpture settles into an upright, symmetrical front-facing circular pose at `4.0π` and stops rotating. *“Ready for what's next? OSTRUM”* is fully visible. This completed closing composition holds stationary for a ~1-second visual dwell (`600px` on desktop / `450px` on mobile). Selected Work does **not** begin its incoming transition early.
4. **Clean Selected Work Handoff:**  
   Only after Pause 2 finishes does the flat solid red Selected Work section (`z-[30]`, `#C9362B`) rise over the viewport (`top: 100vh -> 0vh`), naturally and cleanly covering the closing composition with zero heading leakage or visual jump.
5. **Bidirectional Scrubbing:**  
   Both pauses are integrated directly into the GSAP ScrollTrigger timeline and continuous Three.js render loop. Scrolling forward, pausing midway, or scrolling backward smoothly and accurately scrubs all states in reverse.

---

## 2. Scroll Architecture & Timing Specification

### A. Stage Progression & Landmark Intervals

| Stage / Interval | Scroll Distance | Desktop Span (px) | Model Position | Scale Target | Rotation Target | Typography State | Visual Description |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Section 02 Hold** | `1000px` | `1250 – 2250` | `slotDocX`, `50vh` | `slotScale` | $2.0\pi$ | Columns *01* & *02* locked | Tripartite composition hold. |
| **Section 02 Exit & Approach** | `916px` | `2250 – 3166` | Centers to `50vw`, `50vh` | $sScale \to 1.04x$ | $2.0\pi$ (held still) | Fading out / Dissolved | Background darkens from $0.0 \to 1.0$. Zero rotation. |
| **NEW: Pause 1 (Dark Stage Hold)** | `600px` | `3166 – 3766` | Centered at `50vw`, `50vh` | `energyScale` (`0.58`) | $2.0\pi$ (held still) | All text hidden (`opacity: 0`) | **~1-second cinematic pause** on dark background + centered sculpture. |
| **Narrative Beats 01 – 05** | `5000px` | `3766 – 8766` | Centered at `50vw`, `50vh` | `energyScale` (`0.58`) | $2.0\pi \to 4.0\pi$ | Sequential letter fills | Synchronized typography reveals + 1 full sculpture revolution. |
| **NEW: Pause 2 (Closing Rest Hold)** | `600px` | `8766 – 9366` | Centered at `50vw`, `50vh` | `energyScale` (`0.58`) | $4.0\pi$ (front-facing rest) | Beat 05 100% visible & static | **~1-second cinematic pause** on closing sign-off + resting sculpture. Selected Work offscreen. |
| **Selected Work Handoff** | `100vh` (~928px) | `9366 – 10294` | Centered at `50vw`, `50vh` | `energyScale` | $4.0\pi$ (stationary) | Beat 05 static until covered | Selected Work (`z-[30]`, `#C9362B`) rises to cover stage. |
| **Selected Work Wheel** | `5950px` | `10294 – 16244` | Hidden under red | — | — | Project Wheel Active | Solid red showcase, no fluid shader, no purple spiral. |

---

## 3. Playwright Verification Audit (Tests A Through E)

Empirical verification was conducted against the live production build (`http://localhost:3000/`) at Desktop (1648×928) and Mobile (390×844).

| Test | Objective | Measured Values | Result |
| :--- | :--- | :--- | :---: |
| **Test A: First Pause** | Background dark, sculpture stationary at focal size, zero text visible | `allCardOpacities: ['0','0','0','0','0']`<br>`scale: 0.5058` (target `0.5063`)<br>`rotationY: 1.9968π`<br>`darken: 1.0` | **PASS** |
| **Test B: First Reveal** | Text reveals, rotation initiates in sync | `beat01Opacity: 0.9961`<br>`clipPath: inset(-35% 99.09% -45% 0px)`<br>`rotationY: 2.0719π` (`isRotating: true`) | **PASS** |
| **Test C: Final Pause** | Front-facing resting pose, closing text visible, Selected Work offscreen | `beat05Opacity: 1.0`<br>`rotationY: 3.9913π` (~4.0π front-facing)<br>`selectedWorkTop: 1227px` (`enteredEarly: false`) | **PASS** |
| **Test D: Final Handoff** | Red Selected Work enters cleanly, zero text bleed | `selectedWorkTop: 527px`<br>`selectedWorkBg: rgb(201, 54, 43)`<br>`beat05Opacity: 1.0` (clean coverage) | **PASS** |
| **Test E: Reverse Scroll** | Both pauses and narrative restore in reverse | Pause 2 Reverse: `beat05: 1.0, rotY: 4.0000π`<br>Pause 1 Reverse: `cards: 0, rotY: 2.0038π` | **PASS** |

Zero browser console errors or runtime exceptions were observed during the entire audit run.

---

## 4. Visual Evidence Artifacts

1. `test-A-first-pause.png`: Completed dark stage with stationary sculpture at $2.0\pi$ and zero text.
2. `test-B-first-reveal.png`: Synchronized start of typography reveal and sculpture rotation.
3. `test-C-final-pause.png`: Completed closing composition held stationary at $4.0\pi$ with Selected Work offscreen.
4. `test-D-final-handoff.png`: Clean Selected Work solid red layer rising from bottom without premature fade.
5. `test-E-reverse-pause2.png` & `test-E-reverse-pause1.png`: Complete bidirectional reverse scroll restoration.
6. `test-mobile-pause1.png` & `test-mobile-pause2.png`: Flawless mobile viewport validation.
