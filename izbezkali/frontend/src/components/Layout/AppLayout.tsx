import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  Droplets,
  Map,
  Bell,
  FileText,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: Droplets, label: "Projects" },
  { to: "/map", icon: Map, label: "Map" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/reports", icon: FileText, label: "Reports" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary-600 text-white transform transition-transform lg:translate-x-0 lg:static lg:inset-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 h-16 px-6 border-b border-primary-500">
          <Droplets className="h-8 w-8 text-blue-300" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Izbezkal&#299;</h1>
            <p className="text-xs text-blue-200">Water Dashboard</p>
          </div>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-blue-100 hover:bg-primary-500/50"
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <div className="px-3 py-3 bg-primary-700 rounded-lg">
            <p className="text-xs text-blue-200">Logged in as</p>
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-800">
              {NAV_ITEMS.find((n) => {
                if (n.to === "/") return location.pathname === "/";
                return location.pathname.startsWith(n.to);
              })?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Alert bell */}
            <NavLink to="/alerts" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </NavLink>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2"
              >
                <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <span className="hidden md:inline">{user?.full_name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className="badge-info mt-1">{user?.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 bg-gray-50">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-4 py-3 text-center text-xs text-gray-400">
          Izbezkal&#299; Water Dashboard &copy; {new Date().getFullYear()} &mdash; 7Square Inc.
        </footer>
      </div>
    </div>
  );
}
