"use client";

import React, { useState } from "react";
import SignInForm from "@/components/authentication/signInForm";
import SignUpForm from "@/components/authentication/signUpForm";
import ProjectGallery from "@/components/projects/projectGallery";

export default function Home() {
  const [showSignUp, setShowSignUp] = useState(false); // Toggle between Sign-In and Sign-Up forms
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5dc", // Cream background
        color: "#013220", // Dark green text
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          backgroundColor: "#ffffff", // White background for the form container
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Welcome to GreenView!
        </h1>
        {!isLoggedIn ? (
          showSignUp ? (
            <>
              <SignUpForm />
              <p style={{ marginTop: "20px" }}>
                Already have an account?{" "}
                <button
                  onClick={() => setShowSignUp(false)}
                  style={{
                    color: "#013220",
                    textDecoration: "underline",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                  }}
                >
                  Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              <SignInForm />
              <p style={{ marginTop: "20px" }}>
                Don't have an account?{" "}
                <button
                  onClick={() => setShowSignUp(true)}
                  style={{
                    color: "#013220",
                    textDecoration: "underline",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                  }}
                >
                  Sign Up
                </button>
              </p>
            </>
          )
        ) : (
          <ProjectGallery />
        )}
      </div>
    </div>
  );
}
