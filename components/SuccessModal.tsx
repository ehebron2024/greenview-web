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
      <div
        className="rounded-lg shadow-lg p-8 max-w-md w-full mx-4"
        style={{
          backgroundColor: "#f5f5dc",
        }}
      >
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/print_transparent.svg"
              alt="GreenView Logo"
              style={{
                width: "100px",
                height: "100px",
              }}
            />
          </div>

          <h2
            className="text-2xl font-bold mb-4"
            style={{
              color: "#013220",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            Thank You!
          </h2>

          <p
            className="text-lg mb-6"
            style={{
              color: "#013220",
              fontFamily: "'Poppins', sans-serif",
              lineHeight: "1.6",
            }}
          >
            Thanks for helping us make your dream home. Our team will reach out
            to you shortly.
          </p>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#2e7d32",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "600",
              fontFamily: "'Poppins', sans-serif",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1b5e20")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2e7d32")
            }
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
