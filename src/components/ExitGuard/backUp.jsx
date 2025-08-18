"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../utilis/firebaseClient";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { User, Calendar, Search, CheckCircle, XCircle, FilePlus, Truck, FileCheck, List, } from "lucide-react";

const carMakes = {
  Suzuki: ["Swift", "Alto", "Cultus", "WagonR", "Ciaz", "Vitara", "APV", "Bolan", "Ravi", "Mehran", "Other"],
  Toyota: ["Corolla", "Land Cruiser", "Cross", "Vitz", "Yaris", "Other"],
  Honda: ["Civic", "City", "Fit", "N-One", "Other"],
  Nissan: ["Other"],
  Mazda: ["Other"],
  Other: ["Other"],
};

const ExitGuard = () => {
  const initialData = {
    srNo: "",  // Ensuring it's always a string
    guardName: "",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    carMake: "", // Prevents uncontrolled component issue
    variant: "", // Prevents uncontrolled component issue
    registrationNo: "",
    gatePassNo: "",
    tempGatePassNo: "",
    manualGatePassNo: "",
  };


  const [formData, setFormData] = useState({
    srNo: "",
    guardName: "",
    date: "", // Initially empty to avoid SSR mismatch
    time: "",
    carMake: "",
    variant: "",
    registrationNo: "",
    gatePassNo: "",
    tempGatePassNo: "",
    manualGatePassNo: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    }));
  }, []);


  const [exitRecords, setExitRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("form");


  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    }));
  }, []);


  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchExitRecords();
    }
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setFormData((prev) => ({
        ...prev,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchExitRecords();
  }, []);

  const fetchExitRecords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ExitGuard"));
      const records = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExitRecords(records);
    } catch (error) {
      console.error("Error fetching records: ", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "short" });
      const timestamp = now.getTime(); // Get unique timestamp
      const uniqueSrNo = `${year}/${month}/${timestamp}`; // Generate unique serial number

      const newRecord = { ...formData, srNo: uniqueSrNo, timestamp: new Date().toISOString() };
      const docRef = doc(db, "ExitGuard", uniqueSrNo);

      await setDoc(docRef, newRecord);
      setFormData(initialData);
      fetchExitRecords();

      // Show success notification
      const notification = document.getElementById("notification");
      notification.textContent = "Exit record submitted successfully!";
      notification.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg opacity-100 transition-opacity duration-500";
      setTimeout(() => {
        notification.className += " opacity-0";
      }, 3000);
    } catch (error) {
      // Show error notification
      const notification = document.getElementById("notification");
      notification.textContent = "Submission failed!";
      notification.className = "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg opacity-100 transition-opacity duration-500";
      setTimeout(() => {
        notification.className += " opacity-0";
      }, 3000);

      console.error("Error adding exit record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const filteredExitRecords = useMemo(() => {
    return exitRecords.filter(
      (record) =>
        record.guardName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.carMake?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.registrationNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.gatePassNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, exitRecords]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div id="notification" className="fixed top-4 right-4 opacity-0 transition-opacity duration-500"></div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-40">
        {/* Tabs for switching between Form and Table views */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setViewMode("form")}
            className={`flex items-center px-4 py-2 rounded-md ${viewMode === "form" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors duration-200`}
          >
            <FileCheck className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Create Exit Record</span>
            <span className="sm:hidden">New</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center px-4 py-2 rounded-md ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors duration-200`}
          >
            <List className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">View Exit Records</span>
            <span className="sm:hidden">View</span>
          </button>
        </div>

        {viewMode === "form" ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <User className="w-6 h-6 mr-2" />
                Exit Guard Job Card
              </h2>
              <p className="text-blue-100 text-sm mt-1">Record vehicle exit details</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Serial Number */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  name="srNo"
                  value={formData.srNo}
                  readOnly
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              {/* Exit Guard Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Exit Guard Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Guard Name</label>
                    <input
                      type="text"
                      name="guardName"
                      value={formData.guardName || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    />

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Date & Time</label>
                    <div className="flex items-center text-gray-500 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      <span>{formData.exitDate} at {formData.exitTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <Truck className="w-5 h-5 mr-2 text-blue-600" />
                  Vehicle Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Car Make Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Make</label>
                    <select
                      name="carMake"
                      value={formData.carMake || ""}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Car Make</option>
                      {Object.keys(carMakes).map((make) => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>

                  </div>

                  {/* Registration Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      name="registrationNo"
                      placeholder="Enter registration number"
                      value={formData.registrationNo}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Gate Pass Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gate Pass Number</label>
                  <input
                    type="text"
                    name="gatePassNo"
                    placeholder="Enter gate pass number"
                    value={formData.gatePassNo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(initialData)}
                  className="inline-flex justify-center items-center px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center items-center px-6 py-2 shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit Exit Record"
                  )}
                </button>

              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <List className="w-6 h-6 mr-2" />
                Exit Records
              </h2>
              <p className="text-blue-100 text-sm mt-1">View and search all exit guard records</p>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Sr No, Exit Guard, Car Make, or Registration No..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Exit Records Table */}
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Guard</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Make</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gate Pass No</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExitRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-600 font-medium">No exit records found</p>
                          <p className="text-gray-400 mt-1">Try adjusting your search or create a new exit record</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredExitRecords.map((record, index) => (
                      <tr key={record.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.srNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.guardName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.carMake}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.registrationNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.gatePassNo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitGuard;
