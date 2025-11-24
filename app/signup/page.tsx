"use client";

import React from "react";
import SignUpForm from "../../components/authentication/signUpForm"; // Adjust the path if necessary

export default function SignUpPage() {
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
        padding: "20px",
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
          Create an Account
        </h1>
        {/* Render the SignUpForm component */}
        <SignUpForm />
      </div>
    </div>
  );
}
