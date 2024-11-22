"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isUser, setIsUser] = useState(false); // Toggle between login and sign-up forms
  const router = useRouter();

  // Handle login
  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          credentials: 'include', // Include cookies with the request
        body: JSON.stringify({ username, password }),
      });
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Error logging in");
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);
      router.push("/Homepage");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  // Handle sign-up
  const handleSignUp = async () => {
    try {
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Error signing up");
        return;
      }

      const data = await response.json();
      console.log("Sign-up successful:", data);
      router.push("/Homepage");
    } catch (err) {
      console.error("Sign-up failed:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    if (isUser) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 mr-2" />
            <CardTitle className="text-2xl font-bold">Agendify</CardTitle>
          </div>
          <CardDescription>
            {isUser ? "Log in to your account" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                {isUser ? "Log In" : "Sign Up"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-muted-foreground">
            {isUser ? (
              <>
                Don't have an account?{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setIsUser(false)}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setIsUser(true)}
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
