"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthComponent() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string }>( {
    message: "",
  });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError({ message: "" });

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, role, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      console.log("Registration successful:", data);

      localStorage.setItem(data.role, data.id);

      handleLogin(e);
    } catch (err) {
      setError({
        message: "Registration failed",
        details: err instanceof Error ? err.message : "Please try again.",
      });
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError({ message: "" });

    try {
      const response = await fetch(
        `http://localhost:8000/login?username=${username}&password=${password}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      console.log("Login successful:", data);

      localStorage.setItem(data.role, data.user_id);

      if (data.role === "patient") {
        router.push("/patient/dashboard");
      } else {
        router.push("/doctor/dashboard");
      }
    } catch (err) {
      setError({
        message: "Login failed",
        details:
          err instanceof Error
            ? err.message
            : "Please check your credentials and try again.",
      });
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-[350px] shadow-lg rounded-xl bg-white bg-opacity-80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Authentication</CardTitle>
          <CardDescription className="text-sm text-gray-500">Login or create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-2">
              <TabsTrigger
                value="login"
                className="py-2 px-4 text-lg font-medium text-gray-700 rounded-md transition hover:bg-indigo-100"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="py-2 px-4 text-lg font-medium text-gray-700 rounded-md transition hover:bg-indigo-100"
              >
                Register
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-indigo-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username</Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-indigo-500"
                    required
                  />
                </div>
                <RadioGroup
                  defaultValue="patient"
                  onValueChange={(value) =>
                    setRole(value as "patient" | "doctor")
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="patient" id="patient" />
                    <Label htmlFor="patient">Patient</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor">Doctor</Label>
                  </div>
                </RadioGroup>
                <Button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {error.message && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md mt-4 shadow-md"
              role="alert"
            >
              <strong className="font-bold">{error.message}</strong>
              {error.details && (
                <span className="block sm:inline"> {error.details}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
