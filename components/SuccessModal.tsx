"use client";

import React from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/print_transparent.svg"
              alt="GreenView Logo"
              className="w-[100px] h-[100px]"
            />
          </div>

          <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">
            Thank You!
          </h2>

          <p className="text-lg mb-6 text-[var(--foreground)] leading-relaxed">
            Thanks for helping us make your dream home. Our team will reach out
            to you shortly.
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-green-700 text-white rounded font-semibold hover:bg-green-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
