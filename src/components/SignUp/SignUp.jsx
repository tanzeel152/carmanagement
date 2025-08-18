"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "../../utilis/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../../Context/AuthContext";
import { User, Mail, Phone, Lock, UserCheck, AlertCircle, UserPlus, ArrowLeft } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "entry-guard",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser, setRole } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters long";
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "Users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date().toISOString(),
      });

      setUser(user);
      setRole(formData.role);

      alert("Signup successful!");

      switch (formData.role) {
        case "admin":
          router.push("/pages/dashboard");
          break;
        case "entry-guard":
          router.push("/pages/entry-guard");
          break;
        case "job-controller":
          router.push("/pages/job-controller");
          break;
        case "finance":
          router.push("/pages/finance");
          break;
        case "exit-guard":
          router.push("/pages/exit-guard");
          break;
      }
    } catch (error) {
      setErrors({ firebase: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg p-8 bg-white shadow-xl rounded-xl border border-gray-100 my-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={28} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join our platform with your details</p>
        </div>

        {errors.firebase && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-2" />
              <p className="text-red-600 text-sm">{errors.firebase}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 ">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="pl-10 py-3 pr-3 border border-gray-300 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="Enter your name"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 py-3 pr-3 border border-gray-300 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10 py-3 pr-3 border border-gray-300 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 py-3 pr-3 border border-gray-300 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCheck size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 py-3 pr-3 border border-gray-300 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="py-3 px-4 border border-gray-300 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
            >
              <option value="entry-guard">Entry Guard</option>
              <option value="job-controller">Job Controller</option>
              <option value="finance">Finance</option>
              <option value="exit-guard">Exit Guard</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-6"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center">
                <UserPlus size={18} className="mr-2" />
                Create Account
              </span>
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/pages/login" className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center justify-center mt-2">
                <ArrowLeft size={16} className="mr-1" />
                Back to Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;