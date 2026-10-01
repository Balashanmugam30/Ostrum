'use client';

import React from 'react';

interface PrimaryBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  theme?: 'black' | 'white';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function PrimaryBtn({
  children,
  onClick,
  href,
  className = '',
  theme = 'black',
  type = 'button',
  disabled = false,
}: PrimaryBtnProps) {
  const themeClass = theme === 'white' ? 'theme--white' : 'theme--black';
  const combinedClass = `primary-btn ${themeClass} ${disabled ? 'disabled' : ''} ${className}`.trim();

  const innerContent = (
    <>
      <span className="bg" aria-hidden="true" />
      <span className="text-wrapper">
        <span className="text">{children}</span>
        <span className="text text--clone" aria-hidden="true">{children}</span>
      </span>
      <span className="arrow-wrapper" aria-hidden="true">
        <span className="arrow">→</span>
        <span className="arrow arrow--clone">→</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={combinedClass}
        onClick={onClick}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
    >
      {innerContent}
    </button>
  );
}
