'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LineByLineProps {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span';
  text?: string;
  lines?: string[];
  delay?: number;
  className?: string;
  auto?: boolean;
  repeat?: boolean;
  children?: React.ReactNode;
}

function parseMarkdownHighlights(str: string): React.ReactNode[] {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="highlight">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export function LineByLine({
  tag = 'div',
  text,
  lines,
  delay = 0,
  className = '',
  auto = true,
  repeat = false,
  children,
}: LineByLineProps) {
  const elRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    if (!auto) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!repeat) {
            observer.disconnect();
          }
        } else if (repeat) {
          setIsVisible(false);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [auto, repeat]);

  const rawLines: string[] = lines || (text ? text.split('\n') : []);
  const Tag = tag as any;

  if (rawLines.length > 0) {
    return (
      <Tag
        ref={elRef}
        className={`line-by-line ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
        style={{ transitionDelay: `${delay}s` }}
      >
        {rawLines.map((line, idx) => (
          <span key={idx} className="split-parent block">
            <span
              className="split"
              style={{
                transitionDelay: `${delay + idx * 0.12}s`,
              }}
            >
              {parseMarkdownHighlights(line)}
            </span>
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      ref={elRef}
      className={`line-by-line ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}s` }}
    >
      <span className="split-parent block">
        <span className="split" style={{ transitionDelay: `${delay}s` }}>
          {children}
        </span>
      </span>
    </Tag>
  );
}
