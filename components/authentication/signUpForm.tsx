import React, { useState } from "react";
import { auth } from "../../lib/firebase"; // Ensure this file exists and exports 'auth'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // Call Firebase to create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // If successful, the user is automatically signed in.
      console.log("User signed up and logged in successfully:", userCredential.user);
      setSuccessMessage(`Welcome, ${userCredential.user.email}! You're signed up and logged in.`);
      setEmail("");
      setPassword("");

      // Here you might redirect the user, update UI, etc.
    } catch (firebaseError: any) {
      // Catch Firebase-specific errors
      console.error("Error signing up:", firebaseError.code, firebaseError.message);

      // Provide more user-friendly messages for common Firebase Auth errors
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please use a different email or log in.");
          break;
        case "auth/invalid-email":
          setError("The email address is not valid. Please enter a valid email.");
          break;
        case "auth/weak-password":
          setError("The password is too weak. Please use a stronger password.");
          break;
        default:
          setError("An unknown error occurred during sign up. Please try again later.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSignUp}
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
      }}
    >
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Sign Up
      </h2>
      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
      {successMessage && <p style={{ color: "green", marginBottom: "10px" }}>{successMessage}</p>}
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
          Email:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
          Password:
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "16px",
          }}
        />
      </div>
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#013220", // Dark green
          color: "#ffffff", // White text
          border: "none",
          borderRadius: "8px", // Rounded corners
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
          transition: "background-color 0.3s ease, box-shadow 0.3s ease", // Smooth transitions
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#016936"; // Hover green
          (e.target as HTMLButtonElement).style.boxShadow = "0 6px 10px rgba(0, 0, 0, 0.2)"; // Enhanced shadow
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#013220"; // Default green
          (e.target as HTMLButtonElement).style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"; // Default shadow
        }}
      >
        Sign Up
      </button>
    </form>
  );
};

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      // Call Firebase to sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // If successful, the user is signed in.
      console.log("User signed in successfully:", userCredential.user);
      setSuccessMessage(`Welcome back, ${userCredential.user.email}!`);
      setEmail("");
      setPassword("");
    } catch (firebaseError: any) {
      // Catch Firebase-specific errors
      console.error("Error signing in:", firebaseError.code, firebaseError.message);

      // Provide more user-friendly messages for common Firebase Auth errors
      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No account found with this email. Please sign up first.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-credential":
          setError("Sorry, we can't find those account credentials.");
          break;
        case "auth/invalid-email":
          setError("The email address is not valid. Please enter a valid email.");
          break;
        default:
          setError("An unknown error occurred during sign in. Please try again later.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSignIn}
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "20px",email" style={{ display: "block", marginBottom: "5px" }}>
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
      }}  type="email"
    >     id="email"
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}> value={email}
        Sign In
      </h2>   required
      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}={{
      {successMessage && <p style={{ color: "green", marginBottom: "10px" }}>{successMessage}</p>} width: "100%",
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>olid #ccc",
          Email:
        </label>    fontSize: "16px",
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
          requiredrd:
          style={{
            width: "100%",
            padding: "10px",rd"
            border: "1px solid #ccc",rd"
            borderRadius: "6px",rd}
            fontSize: "16px",e)}
          }}
        />
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
          Password:
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}submit"
          required
          style={{
            width: "100%", padding: "12px",
            padding: "10px",dColor: "#013220", // Dark green
            border: "1px solid #ccc", "#ffffff", // White text
            borderRadius: "6px",er: "none",
            fontSize: "16px",8px", // Rounded corners
          }}px",
        />d",
      </div>
      <buttonw: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
        type="submit"on: "background-color 0.3s ease, box-shadow 0.3s ease", // Smooth transitions
        style={{
          width: "100%", {
          padding: "12px",ent).style.backgroundColor = "#016936"; // Hover green
          backgroundColor: "#013220", // Dark greennElement).style.boxShadow = "0 6px 10px rgba(0, 0, 0, 0.2)"; // Enhanced shadow
          color: "#ffffff", // White text
          border: "none",useLeave={(e) => {
          borderRadius: "8px", // Rounded corners(e.target as HTMLButtonElement).style.backgroundColor = "#013220"; // Default green
          fontSize: "16px",.target as HTMLButtonElement).style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"; // Default shadow
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
          transition: "background-color 0.3s ease, box-shadow 0.3s ease", // Smooth transitions
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = "#016936"; // Hover green
          (e.target as HTMLButtonElement).style.boxShadow = "0 6px 10px rgba(0, 0, 0, 0.2)"; // Enhanced shadow
        }}
        onMouseLeave={(e) => {          (e.target as HTMLButtonElement).style.backgroundColor = "#013220"; // Default green          (e.target as HTMLButtonElement).style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"; // Default shadow        }}      >        Sign In      </button>    </form>  );};export { SignUpForm, SignInForm };