import React, { useId } from 'react';

export type OstrumSculpturePlacement = 'capabilities' | 'selected-work';

/** A lightweight shared SVG sculpture for Ostrum's two editorial compositions. */
export function OstrumSignatureSculpture({
  placement = 'capabilities',
}: {
  placement?: OstrumSculpturePlacement;
}) {
  const id = useId().replace(/:/g, '');
  const auraId = `${id}-aura`;
  const mainRibbonId = `${id}-ribbon-main`;
  const deepRibbonId = `${id}-ribbon-deep`;
  const glintId = `${id}-ribbon-glint`;

  return (
    <svg
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ostrum-signature-sculpture ostrum-signature-sculpture--${placement}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={auraId} cx="0" cy="0" r="1" gradientTransform="matrix(0 190 -190 0 240 232)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9362B" stopOpacity=".2" />
          <stop offset=".62" stopColor="#64120F" stopOpacity=".08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={mainRibbonId} x1="76" y1="146" x2="394" y2="327" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8F3" />
          <stop offset=".2" stopColor="#FFDDD8" />
          <stop offset=".48" stopColor="#C9362B" />
          <stop offset=".72" stopColor="#8D2620" />
          <stop offset="1" stopColor="#FFF8F3" />
        </linearGradient>
        <linearGradient id={deepRibbonId} x1="97" y1="331" x2="375" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A0B0A" />
          <stop offset=".28" stopColor="#64120F" />
          <stop offset=".56" stopColor="#FFF8F3" />
          <stop offset=".78" stopColor="#C9362B" />
          <stop offset="1" stopColor="#42100F" />
        </linearGradient>
        <linearGradient id={glintId} x1="103" y1="166" x2="352" y2="285" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".86" />
          <stop offset=".5" stopColor="#FFE8E4" stopOpacity=".66" />
          <stop offset="1" stopColor="#fff" stopOpacity=".2" />
        </linearGradient>
      </defs>

      <ellipse cx="240" cy="236" rx="196" ry="190" fill={`url(#${auraId})`} />
      <ellipse cx="241" cy="374" rx="100" ry="10" fill="#42100F" fillOpacity=".08" />

      {/* Fine orbital traces give the sculpture depth without adding another renderer. */}
      <ellipse
        cx="240"
        cy="235"
        rx="166"
        ry="70"
        transform="rotate(-28 240 235)"
        stroke="#C9362B"
        strokeOpacity=".34"
        strokeWidth="1.5"
      />
      <ellipse
        cx="240"
        cy="235"
        rx="151"
        ry="83"
        transform="rotate(31 240 235)"
        stroke="#FF765E"
        strokeOpacity=".35"
        strokeWidth="1.2"
      />

      {/* Two broad, interwoven ribbons form an abstract orbital O. */}
      <path
        d="M101 246C80 190 112 127 171 104C233 80 310 101 346 151C378 196 364 255 323 283C288 307 241 302 217 273C197 249 205 217 229 203C251 191 282 197 296 218"
        stroke={`url(#${deepRibbonId})`}
        strokeWidth="31"
        strokeLinecap="round"
      />
      <path
        d="M101 246C80 190 112 127 171 104C233 80 310 101 346 151C378 196 364 255 323 283C288 307 241 302 217 273C197 249 205 217 229 203C251 191 282 197 296 218"
        stroke={`url(#${glintId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="152 33 54 260"
        opacity=".78"
      />
      <path
        d="M374 226C394 284 362 347 304 370C246 393 170 373 133 325C97 278 111 219 151 190C186 165 232 171 256 200C276 224 268 257 244 270C221 283 190 276 176 255"
        stroke={`url(#${mainRibbonId})`}
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M374 226C394 284 362 347 304 370C246 393 170 373 133 325C97 278 111 219 151 190C186 165 232 171 256 200C276 224 268 257 244 270C221 283 190 276 176 255"
        stroke={`url(#${glintId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="188 45 58 240"
        opacity=".86"
      />

      <circle cx="346" cy="151" r="4" fill="#FFF8F3" />
      <circle cx="133" cy="325" r="3.5" fill="#FFDDD8" />
    </svg>
  );
}
