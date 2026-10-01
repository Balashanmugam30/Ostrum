'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { PrimaryBtn } from '@/components/ui/PrimaryBtn';

export function OrderModal() {
  const { isModalOpen, closeModal, modalMode, setModalMode, t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const isPhysical = modalMode === 'physical';
  const price = isPhysical ? t.modal.physicalPrice : t.modal.digitalPrice;
  const shipping = isPhysical ? t.modal.physicalShipping : null;
  const details = isPhysical ? t.modal.physicalDetails : t.modal.digitalDetails;
  const buyCta = isPhysical ? t.modal.physicalBuyCta : t.modal.digitalBuyCta;
  const stripeUrl = isPhysical
    ? 'https://buy.stripe.com/cNi6oz4846MY5Ve1tw28805'
    : 'https://buy.stripe.com/14A14faws9Za6Zidce28804';

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content relative w-full max-w-[820px] bg-[#e1ddd1] text-black rounded-md overflow-hidden shadow-2xl transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="modal-close absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-black hover:bg-neutral-100 transition-colors"
          aria-label={t.modal.closeLabel}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6L18 18" />
          </svg>
        </button>

        <div className="modal-body flex flex-col md:flex-row">
          {/* Left Cover Artwork Preview */}
          <div className="modal-cover w-full md:w-[45%] bg-[#d6d0c2]/50 p-8 flex items-center justify-center min-h-[300px] md:min-h-[440px]">
            <div className="relative w-[220px] h-[300px] transition-transform duration-500 ease-out transform perspective-[800px]">
              <div
                className="w-full h-full relative rounded shadow-xl overflow-hidden transition-transform duration-500"
                style={{
                  transform: isPhysical ? 'rotateY(-8deg) rotateX(2deg)' : 'none',
                }}
              >
                <Image
                  src={isPhysical ? '/images/book.webp' : '/images/folder.webp'}
                  alt={isPhysical ? 'Hardcover Book Preview' : 'Digital Edition Preview'}
                  fill
                  sizes="300px"
                  className={`transition-all duration-300 ${isPhysical ? 'object-cover object-right' : 'object-contain'}`}
                />
              </div>
            </div>
          </div>

          {/* Right Ordering Information */}
          <div className="modal-info w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Format Toggle Switch */}
              <div className="modal-switch relative flex bg-black/5 p-1 rounded mb-6">
                <button
                  type="button"
                  onClick={() => setModalMode('physical')}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded transition-all duration-200 ${
                    isPhysical
                      ? 'bg-black text-white shadow-sm'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  {t.modal.physicalTab}
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('digital')}
                  className={`flex-1 py-2 text-xs md:text-sm font-medium rounded transition-all duration-200 ${
                    !isPhysical
                      ? 'bg-black text-white shadow-sm'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  {t.modal.digitalTab}
                </button>
              </div>

              {/* Price Display */}
              <div className="modal-price mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-serif tracking-tight text-black">
                    {price}
                  </span>
                  {shipping && (
                    <span className="text-xs text-black/60 font-medium">
                      {shipping}
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="modal-details space-y-2.5 text-xs md:text-sm text-black/80 font-normal leading-relaxed">
                {details.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-black/40 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkout Action Button */}
            <div className="mt-8 pt-6 border-t border-black/10">
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full primary-btn theme--black modal-buy-btn py-3.5 text-center justify-center font-medium block"
              >
                <span className="bg" aria-hidden="true" />
                <span className="text-wrapper">
                  <span className="text">{buyCta}</span>
                  <span className="text text--clone" aria-hidden="true">{buyCta}</span>
                </span>
                <span className="arrow-wrapper" aria-hidden="true">
                  <span className="arrow">→</span>
                  <span className="arrow arrow--clone">→</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
