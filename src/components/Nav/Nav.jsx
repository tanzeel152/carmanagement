"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../utilis/firebaseConfig";

// Import Lucide icons
import { 
  Menu, X, Home, Shield, Briefcase, 
  DollarSign, LogOut, ArrowRight, User, Car
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Get corresponding icon for each link
  const getIcon = (path) => {
    switch (path) {
      case "/pages/dashboard":
        return <Home className="w-5 h-5 mr-2" />;
      case "/pages/entry-guard":
        return <Shield className="w-5 h-5 mr-2" />;
      case "/pages/job-controller":
        return <Briefcase className="w-5 h-5 mr-2" />;
      case "/pages/finance":
        return <DollarSign className="w-5 h-5 mr-2" />;
      case "/pages/exit-guard":
        return <ArrowRight className="w-5 h-5 mr-2" />;
      default:
        return null;
    }
  };

  // Conditionally Render Links Based on Role
  const renderNavLinks = () => {
    const links = [];
    
    switch (role) {
      case "admin":
        links.push(
          { path: "/pages/dashboard", label: "Dashboard" },
          { path: "/pages/entry-guard", label: "Entry Guard" },
          { path: "/pages/job-controller", label: "Job Controller" },
          { path: "/pages/finance", label: "Finance" },
          { path: "/pages/exit-guard", label: "Exit Guard" }
        );
        break;
      case "entry-guard":
        links.push({ path: "/pages/entry-guard", label: "Entry Guard" });
        break;
      case "job-controller":
        links.push({ path: "/pages/job-controller", label: "Job Controller" });
        break;
      case "finance":
        links.push({ path: "/pages/finance", label: "Finance" });
        break;
      case "exit-guard":
        links.push({ path: "/pages/exit-guard", label: "Exit Guard" });
        break;
      default:
        break;
    }

    return links.map((link) => (
      <Link
  key={link.path}
  href={link.path}
  className={`flex items-center py-2 px-4 rounded-md transition-colors duration-200 ${
    pathname === link.path ? "bg-blue-700 text-white" : "hover:bg-blue-600"
  }`}
>
  {getIcon(link.path)}
  <span className="whitespace-nowrap">{link.label}</span> {/* Ensures text stays inline */}
</Link>

    ));
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/pages/login");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <nav className=" w-full bg-blue-500 text-white shadow-md z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center p-4">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <Car className="w-6 h-6" />
            <span className="font-bold text-xl">Car Management</span>
          </div>

          {/* Wrapper for Desktop Menu and User Info to enable justify-between */}
          <div className="hidden md:flex md:flex-row md:justify-between md:flex-grow items-center ml-8">
            {/* Desktop Menu */}
            <div className="flex flex-row items-center space-x-2">
              {renderNavLinks()}
            </div>

            {/* User Info & Logout Button for Desktop */}
            {user && (
              <div className="flex flex-row items-center space-x-4 ml-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span className="text-sm truncate max-w-[150px]">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Button for Mobile */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-blue-600 p-4 flex flex-col space-y-3 animate-fadeIn">
            {renderNavLinks()}
            {user && (
              <div className="pt-4 border-t border-blue-400 mt-2">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-4 h-4" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;