import React, { useState } from "react";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PublicTicketPage from "./PublicTicketPage";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const [ShowPublicTicket, setShowPublicTicket] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
     // or use <CheckCircle /> from lucide-react

      navigate("/dashboard"); // 🚀 redirect to dashboard
    } catch (err) {
      setError("Invalid credentials");
      toast.error("Login failed ❌");
    }
  };

  if (ShowPublicTicket) {
    return <PublicTicketPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-blue-300 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-red-50 to-blue-300 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center ">
              <img
                src="https://teratech.co.tz/assets/logo-4eACH_FU.png"
                alt="Logo"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={<Lock size={18} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-2">
            <div
              onClick={() => setShowPublicTicket(true)}
              className="hover:bg-blue-100 items-center justify-center px-4 py-3 rounded-lg shadow-lg transition-colors duration-200 cursor-pointer"
            >
              File a ticket without being registered..
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
