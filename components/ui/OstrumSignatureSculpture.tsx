import React from 'react';

/** A lightweight, Ostrum-colored orbital ribbon for the Capabilities composition. */
export function OstrumSignatureSculpture() {
  return (
    <svg
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="capabilities-sculpture-art"
      role="img"
      aria-label="Interwoven Ostrum orbital ribbon"
      focusable="false"
    >
      <defs>
        <radialGradient id="ostrum-sculpture-aura" cx="0" cy="0" r="1" gradientTransform="matrix(0 190 -190 0 240 232)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A8C8FF" stopOpacity=".27" />
          <stop offset=".62" stopColor="#D9CEFF" stopOpacity=".11" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ostrum-ribbon-main" x1="76" y1="146" x2="394" y2="327" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDFDFF" />
          <stop offset=".2" stopColor="#BACDFF" />
          <stop offset=".48" stopColor="#7A79E9" />
          <stop offset=".72" stopColor="#C8BEF5" />
          <stop offset="1" stopColor="#FCFDFF" />
        </linearGradient>
        <linearGradient id="ostrum-ribbon-deep" x1="97" y1="331" x2="375" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34334D" />
          <stop offset=".28" stopColor="#7779B9" />
          <stop offset=".56" stopColor="#F4F2FF" />
          <stop offset=".78" stopColor="#A9B8EA" />
          <stop offset="1" stopColor="#393951" />
        </linearGradient>
        <linearGradient id="ostrum-ribbon-glint" x1="103" y1="166" x2="352" y2="285" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".86" />
          <stop offset=".5" stopColor="#D7F7FF" stopOpacity=".66" />
          <stop offset="1" stopColor="#fff" stopOpacity=".2" />
        </linearGradient>
        <filter id="ostrum-ribbon-shadow" x="28" y="62" width="424" height="365" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <ellipse cx="240" cy="236" rx="196" ry="190" fill="url(#ostrum-sculpture-aura)" />
      <ellipse cx="241" cy="374" rx="113" ry="17" fill="#55547A" fillOpacity=".11" filter="url(#ostrum-ribbon-shadow)" />

      {/* Fine orbital traces give the sculpture depth without adding another renderer. */}
      <ellipse
        cx="240"
        cy="235"
        rx="166"
        ry="70"
        transform="rotate(-28 240 235)"
        stroke="#7C88D0"
        strokeOpacity=".34"
        strokeWidth="1.5"
      />
      <ellipse
        cx="240"
        cy="235"
        rx="151"
        ry="83"
        transform="rotate(31 240 235)"
        stroke="#B8A9EF"
        strokeOpacity=".42"
        strokeWidth="1.2"
      />

      {/* Two broad, interwoven ribbons form an abstract orbital O. */}
      <path
        d="M101 246C80 190 112 127 171 104C233 80 310 101 346 151C378 196 364 255 323 283C288 307 241 302 217 273C197 249 205 217 229 203C251 191 282 197 296 218"
        stroke="url(#ostrum-ribbon-deep)"
        strokeWidth="31"
        strokeLinecap="round"
      />
      <path
        d="M101 246C80 190 112 127 171 104C233 80 310 101 346 151C378 196 364 255 323 283C288 307 241 302 217 273C197 249 205 217 229 203C251 191 282 197 296 218"
        stroke="url(#ostrum-ribbon-glint)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="152 33 54 260"
        opacity=".78"
      />
      <path
        d="M374 226C394 284 362 347 304 370C246 393 170 373 133 325C97 278 111 219 151 190C186 165 232 171 256 200C276 224 268 257 244 270C221 283 190 276 176 255"
        stroke="url(#ostrum-ribbon-main)"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M374 226C394 284 362 347 304 370C246 393 170 373 133 325C97 278 111 219 151 190C186 165 232 171 256 200C276 224 268 257 244 270C221 283 190 276 176 255"
        stroke="url(#ostrum-ribbon-glint)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="188 45 58 240"
        opacity=".86"
      />

      <circle cx="346" cy="151" r="4" fill="#F8FCFF" />
      <circle cx="133" cy="325" r="3.5" fill="#D8D5FF" />
    </svg>
  );
}
