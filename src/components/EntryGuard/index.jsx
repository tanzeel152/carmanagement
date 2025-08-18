"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../utilis/firebaseClient";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import Navbar from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import { Calendar, Search, Truck, FileCheck, List, Shield } from "lucide-react";


const JobCardForm = () => {
  const initialData = {
    srNo: "",
    entryGuardName: "",
    entryTime: new Date().toLocaleTimeString(),
    entryDate: new Date().toLocaleDateString(),
    carMake: "",
    otherCarMake: "",
    variant: "",
    registrationNo: "",
    chassisNumber: "",
    isUnregistered: false,
    unregisteredSerialNo: "",
  };

  const [formData, setFormData] = useState({
    srNo: "",
    entryGuardName: "",
    entryTime: "",
    entryDate: "",
    carMake: "",
    otherCarMake: "",
    variant: "",
    registrationNo: "",
    chassisNumber: "",
    isUnregistered: false,
    unregisteredSerialNo: "",
  });

  const [touched, setTouched] = useState({ registrationNo: false });



  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      entryTime: new Date().toLocaleTimeString(),
      entryDate: new Date().toLocaleDateString(),
    }));
  }, []);

  const [variants, setVariants] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("form"); // form or table
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("default", { month: "short" }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const filteredJobCards = useMemo(() => {
    return jobCards.filter(
      (card) =>
        card.srNo?.toLowerCase().includes(searchQuery) ||
        card.entryGuardName?.toLowerCase().includes(searchQuery) ||
        card.carMake?.toLowerCase().includes(searchQuery) ||
        card.variant?.toLowerCase().includes(searchQuery) ||
        card.registrationNo?.toLowerCase().includes(searchQuery) ||
        card.chassisNumber?.toLowerCase().includes(searchQuery) ||
        card.unregisteredSerialNo?.toLowerCase().includes(searchQuery)
    );
  }, [searchQuery, jobCards]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const carMakes = {
    Suzuki: ["Swift", " Alto", "Cultus", "Wagon R", "Ravi", "Bolan", "Mehran", "Hustler", "Every", "Vitara", "APV", "CIAZ", "KIZASHI", "Fronx K ", "carry", "Other"],
    Toyota: ["Corolla", "Land Cruiser", "Cross", "Vitz", "Yaris", "Other"],
    Honda: ["Civic", "City", "Fit", "N-One", "Other"],
    Nissan: ["Note", "Juke", "Leaf", "Other"],
    Mazda: ["CX-5", "CX-30", "Mazda3", "Other"],
    Other: ["Other"],
  };

  const fetchJobCards = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, `EntryGuard/${selectedYear}/${selectedMonth}`));

      if (querySnapshot.empty) {
        console.warn(`No job cards found for ${selectedYear}/${selectedMonth}.`);
      }

      const jobCardsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log(`Fetched job cards for ${selectedYear}/${selectedMonth}:`, jobCardsData);

      setJobCards(jobCardsData);
    } catch (error) {
      console.error("Error fetching job cards:", error);
    }
  };

  const generateSrNo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString("default", { month: "short" });
    const uniqueId = now.getTime(); // Unique timestamp-based ID

    setFormData((prev) => ({ ...prev, srNo: `${year}/${month}/${uniqueId}` }));
  };


  useEffect(() => {
    generateSrNo();
    fetchJobCards();
  }, [selectedMonth, selectedYear]);

  const generateUnregisteredSerialNo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString("default", { month: "short" });
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `UNREG-${year}-${month}-${randomNumber}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      let updatedData = { ...prev, [name]: type === "checkbox" ? checked : value };

      if (name === "carMake") {
        setVariants(carMakes[value] || []);
        updatedData.otherCarMake = "";
      }

      if (name === "isUnregistered") {
        updatedData.unregisteredSerialNo = checked ? generateUnregisteredSerialNo() : "";
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.toLocaleString("default", { month: "short" });
      const timestamp = now.getTime();
      const uniqueSrNo = `${year}/${month}/${timestamp}`;
      const newEntry = { ...formData, srNo: uniqueSrNo };

      await setDoc(doc(db, "EntryGuard", uniqueSrNo), newEntry);

      alert("Job Card Created Successfully!");

      // Show success notification
      const notification = document.getElementById("notification");
      notification.textContent = "Job card submitted successfully!";
      notification.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg opacity-100 transition-opacity duration-500";
      setTimeout(() => {
        notification.className += " opacity-0";
      }, 3000);


      // Reset form while regenerating the serial number
      setFormData((prev) => ({
        ...initialData,
        entryTime: new Date().toLocaleTimeString(),
        entryDate: new Date().toLocaleDateString(),
        srNo: `${year}/${month}/${Date.now()}`  // Generate a new serial number
      }));

      fetchJobCards(); // Refresh job cards
    } catch (error) {
      // Show error notification
      const notification = document.getElementById("notification");
      notification.textContent = "Submission failed!";
      notification.className = "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg opacity-100 transition-opacity duration-500";
      setTimeout(() => {
        notification.className += " opacity-0";
      }, 3000);

      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50  md:p-20">


      <div id="notification" className="fixed top-4 right-4 opacity-0 transition-opacity duration-500"></div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 ">

        {/* Tabs for switching between Form and Table views */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setViewMode("form")}
            className={`flex items-center px-4 py-2 rounded-md ${viewMode === "form" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors duration-200`}
          >
            <FileCheck className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Create Job Card</span>
            <span className="sm:hidden">New</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center px-4 py-2 rounded-md ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors duration-200`}
          >
            <List className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">View Job Cards</span>
            <span className="sm:hidden">View</span>
          </button>
        </div>

        {viewMode === "form" ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Entry Guard Job Card
              </h2>
              <p className="text-blue-100 text-sm mt-1">Create a new vehicle entry record</p>
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

              {/* Entry Guard Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Entry Guard Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entry Guard Name</label>
                    <input
                      type="text"
                      name="entryGuardName"
                      placeholder="Enter guard name"
                      value={formData.entryGuardName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entry Date & Time</label>
                    <div className="flex items-center text-gray-500 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      <span>{formData.entryDate} at {formData.entryTime}</span>
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
                      value={formData.carMake}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Car Make</option>
                      {Object.keys(carMakes).map((make) => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                  </div>

                  {/* Variant Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Variant</label>
                    <select
                      name="variant"
                      value={formData.variant}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      disabled={!formData.carMake}
                    >
                      <option value="">Select Variant</option>
                      {variants.map((variant) => (
                        <option key={variant} value={variant}>{variant}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Other Car Make Input */}
                {formData.carMake === "Other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Car Make</label>
                    <input
                      type="text"
                      name="otherCarMake"
                      placeholder="Specify car make"
                      value={formData.otherCarMake}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Registration & Chassis Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="registrationNo"
                      placeholder="Enter registration number"
                      value={formData.registrationNo}
                      onChange={handleChange}
                      required
                      disabled={formData.isUnregistered}
                      className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 
          ${formData.isUnregistered ? "bg-gray-100 text-gray-500 border-gray-300" :
                          formData.registrationNo || !touched.registrationNo ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500" :
                            "border-red-500 focus:ring-red-500 focus:border-red-500"}`}
                    />

                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chassis Number
                    </label>
                    <input
                      type="text"
                      name="chassisNumber"
                      placeholder="Enter chassis number"
                      value={formData.chassisNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                </div>

                {/* Unregistered Car Checkbox */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isUnregistered"
                      name="isUnregistered"
                      checked={formData.isUnregistered}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isUnregistered" className="ml-2 block text-sm text-gray-700">
                      Unregistered Vehicle
                    </label>
                  </div>

                  {/* Unregistered Serial Number */}
                  {formData.isUnregistered && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unregistered Serial No.</label>
                      <input
                        type="text"
                        name="unregisteredSerialNo"
                        value={formData.unregisteredSerialNo}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-700"
                      />
                    </div>
                  )}
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
                    "Submit Job Card"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <List className="w-6 h-6 mr-2" />
                View Job Cards
              </h2>
              <p className="text-blue-100 text-sm mt-1">Browse and search job card records</p>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search job cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                  />
                </div>

                {/* Month-Year Filter */}
                <div className="flex flex-wrap gap-2">
                  <div className="relative inline-block w-32">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative inline-block w-32">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Cards Table */}
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Guard</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Make</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chassis No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unreg Serial</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobCards.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-600 font-medium">No job cards found</p>
                          <p className="text-gray-400 mt-1">Try adjusting your search or create a new job card</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredJobCards.map((card, index) => (
                      <tr key={card.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm text-gray-900">{card.srNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{card.entryGuardName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{card.carMake}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{card.variant}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{card.registrationNo || "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{card.chassisNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{card.isUnregistered ? card.unregisteredSerialNo : "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (if needed) - just a mockup for now */}
            {filteredJobCards.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredJobCards.length}</span> of{" "}
                      <span className="font-medium">{filteredJobCards.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        1
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default JobCardForm;