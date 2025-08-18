"use client";

import React, { useState } from "react";
import Navbar from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";

const TechnicalAdvisor = () => {
  const [isTestDriveRequired, setIsTestDriveRequired] = useState(false);
  const [testDriveResults, setTestDriveResults] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    vehicleMake: "",
    vehicleModel: "",
  });

  const [errors, setErrors] = useState({});

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear errors when user types
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Handle Test Drive Checkbox
  const handleTestDriveChange = (e) => {
    setIsTestDriveRequired(e.target.checked);
    if (!e.target.checked) {
      setTestDriveResults("");
      setErrors({ ...errors, testDriveResults: "" });
    }
  };

  // Handle Test Drive Result Change
  const handleTestDriveResultChange = (e) => {
    setTestDriveResults(e.target.value);
    setErrors({ ...errors, testDriveResults: "" });
  };

  // Validate Inputs
  const validateForm = () => {
    let validationErrors = {};
    if (!formData.customerName.trim()) validationErrors.customerName = "Customer Name is required";
    if (!formData.vehicleMake.trim()) validationErrors.vehicleMake = "Vehicle Make is required";
    if (!formData.vehicleModel.trim()) validationErrors.vehicleModel = "Vehicle Model is required";
    if (isTestDriveRequired && !testDriveResults.trim()) {
      validationErrors.testDriveResults = "Test Drive Results are required";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("Form Submitted:", formData);
    console.log("Test Drive Results:", testDriveResults);
    alert("Form submitted successfully!");
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl min-h-[600px] mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-2xl font-semibold mb-6">Technical Advisor - Service Process</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer and Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Customer and Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Customer Name */}
              <div>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Customer Name"
                  className="input p-2 border rounded w-full"
                  onChange={handleChange}
                  value={formData.customerName}
                />
                {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
              </div>

              {/* Vehicle Make */}
              <div>
                <input
                  type="text"
                  name="vehicleMake"
                  placeholder="Vehicle Make"
                  className="input p-2 border rounded w-full"
                  onChange={handleChange}
                  value={formData.vehicleMake}
                />
                {errors.vehicleMake && <p className="text-red-500 text-sm mt-1">{errors.vehicleMake}</p>}
              </div>

              {/* Vehicle Model */}
              <div>
                <input
                  type="text"
                  name="vehicleModel"
                  placeholder="Vehicle Model"
                  className="input p-2 border rounded w-full"
                  onChange={handleChange}
                  value={formData.vehicleModel}
                />
                {errors.vehicleModel && <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>}
              </div>
            </div>
          </div>

          {/* Test Drive Checkbox */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Test Drive</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isTestDriveRequired}
                onChange={handleTestDriveChange}
                className="w-5 h-5"
              />
              <span className="text-md">Is a test drive required?</span>
            </label>
          </div>

          {/* Test Drive Results */}
          {isTestDriveRequired && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Test Drive Results</h3>
              <textarea
                name="testDriveResults"
                placeholder="Enter test drive results here..."
                className="input p-2 border rounded w-full h-32"
                onChange={handleTestDriveResultChange}
                value={testDriveResults}
              />
              {errors.testDriveResults && <p className="text-red-500 text-sm mt-1">{errors.testDriveResults}</p>}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-start space-x-4">
            <button type="button" className="border px-4 py-2 rounded bg-gray-300">Cancel</button>
            <button type="submit" className="border px-4 py-2 rounded bg-blue-500 text-white">Submit</button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default TechnicalAdvisor;
