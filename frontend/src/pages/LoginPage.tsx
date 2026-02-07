import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Droplets, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white flex-col justify-center items-center p-12">
        <Droplets className="h-20 w-20 text-blue-300 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Izbezkal&#299;</h1>
        <p className="text-xl text-blue-200 text-center max-w-md">
          National Water Infrastructure Monitoring Dashboard
        </p>
        <p className="mt-6 text-blue-300 text-sm text-center max-w-sm">
          Real-time monitoring of water projects across Tanzania.
          Flow, pressure, quality, and compliance — all in one place.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold">26</p>
            <p className="text-xs text-blue-300">Regions</p>
          </div>
          <div>
            <p className="text-3xl font-bold">1,500+</p>
            <p className="text-xs text-blue-300">Projects</p>
          </div>
          <div>
            <p className="text-3xl font-bold">30M+</p>
            <p className="text-xs text-blue-300">People Served</p>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Droplets className="h-10 w-10 text-primary-500" />
            <h1 className="text-2xl font-bold text-primary-600">Izbezkal&#299;</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to access the dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-800 mb-2">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              <div>minister@maji.go.tz</div><div>minister123</div>
              <div>ceo@dawasa.go.tz</div><div>ceo123</div>
              <div>operator@dawasa.go.tz</div><div>operator123</div>
              <div>public@example.com</div><div>public123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
