"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../utilis/firebaseConfig";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { Calendar, Search, Truck, FileCheck, List, Shield, File, FileText } from "lucide-react";



const ExitGuard = () => {
  const initialData = {
    srNo: "",
    exitGuardName: "",
    exitTime: new Date().toLocaleTimeString(),
    exitDate: new Date().toLocaleDateString(),
    carMake: "",
    otherCarMake: "",
    variant: "",
    registrationNo: "",
    isUnregistered: false,
    unregisteredSerialNo: "",
    gatePassNumber: "",
    tempGatePassNumber: "",
    manualGatePassNumber: ""
  };

  const [formData, setFormData] = useState({
    srNo: "",
    exitGuardName: "",
    exitTime: "",
    exitDate: "",
    carMake: "",
    otherCarMake: "",
    variant: "",
    registrationNo: "",
    isUnregistered: false,
    unregisteredSerialNo: "",
    gatePassNumber: "",
    tempGatePassNumber: "",
    manualGatePassNumber: ""
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      exitTime: new Date().toLocaleTimeString(),
      exitDate: new Date().toLocaleDateString(),
    }));
  }, []);

  const [variants, setVariants] = useState([]);
  const [exitRecords, setExitRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("form"); // form or table
  const [jobCardOptions, setJobCardOptions] = useState([]);
  const [selectedJobCard, setSelectedJobCard] = useState(null);
  const [lastSerialNumber, setLastSerialNumber] = useState(0);

  const filteredExitRecords = useMemo(() => {
    return exitRecords.filter(
      (record) =>
        record.srNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.exitGuardName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.carMake?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.variant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.registrationNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.gatePassNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, exitRecords]);

  const carMakes = {
    Suzuki: ["Swift", " Alto", "Cultus", "Wagon R", "Ravi", "Bolan", "Mehran", "Hustler", "Every", "Vitara", "APV", "CIAZ", "KIZASHI", "Fronx K ", "carry", "Other"],
    Toyota: ["Corolla", "Land Cruiser", "Cross", "Vitz", "Yaris", "Other"],
    Honda: ["Civic", "City", "Fit", "N-One", "Other"],
    Nissan: ["Note", "Juke", "Leaf", "Other"],
    Mazda: ["CX-5", "CX-30", "Mazda3", "Other"],
    Other: ["Other"],
  };

  const fetchExitRecords = async () => {
    try {
      const year = new Date().getFullYear().toString();
      const month = new Date().toLocaleString("default", { month: "short" });

      const querySnapshot = await getDocs(collection(db, `ExitGuard/${year}/${month}`));

      if (querySnapshot.empty) {
        console.warn(`No exit records found for ${year}/${month}.`);
      }

      const exitRecordsData = [];
      const unregisteredSerials = [];

      querySnapshot.docs.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        exitRecordsData.push(data);

        // Track unregistered vehicles by checking if unregisteredSerialNo is not empty
        if (data.unregisteredSerialNo?.trim()) {
          const serialNumber = parseInt(data.unregisteredSerialNo.match(/\d+/)?.[0] || "0", 10);
          unregisteredSerials.push(serialNumber);
        }
      });

      console.log(`Fetched exit records for ${year}/${month}:`, exitRecordsData);
      setExitRecords(exitRecordsData);

      // Update last serial number based on unregistered vehicles
      setLastSerialNumber(unregisteredSerials.length > 0 ? Math.max(...unregisteredSerials) : 0);
    } catch (error) {
      console.error("Error fetching exit records:", error);
    }
  };


  const fetchJobCards = async () => {
    try {
      const year = new Date().getFullYear().toString();
      const month = new Date().toLocaleString("default", { month: "short" });
  
      // Fetch cars from EntryGuard
      const entrySnapshot = await getDocs(collection(db, `EntryGuard/${year}/${month}`));
      const entryCars = entrySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      // Fetch cars from ExitGuard
      const exitSnapshot = await getDocs(collection(db, `ExitGuard/${year}/${month}`));
      const exitCarNumbers = new Set();
      const exitUnregisteredSerials = new Set();
  
      exitSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data?.registrationNo?.trim()) {
          exitCarNumbers.add(data.registrationNo);
        }
        if (data?.unregisteredSerialNo?.trim()) {
          exitUnregisteredSerials.add(data.unregisteredSerialNo);
        }
      });
  
      // Filter out cars that are already in ExitGuard
      const availableJobCards = entryCars.filter((car) => {
        const isRegisteredCar =
          car.registrationNo?.trim() &&
          !exitCarNumbers.has(car.registrationNo.trim());
  
        const isUnregisteredCar =
          car.isUnregistered &&
          car.unregisteredSerialNo?.trim() &&
          !exitUnregisteredSerials.has(car.unregisteredSerialNo.trim());
  
        console.log("isRegisteredCar:", isRegisteredCar);
        console.log("isUnregisteredCar:", isUnregisteredCar);
  
        return isRegisteredCar || isUnregisteredCar;
      });
  
      setJobCardOptions(availableJobCards);
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
    fetchExitRecords();
    fetchJobCards();
  }, []);

  const generateUnregisteredSerialNo = () => {
    const newSerialNumber = lastSerialNumber + 1;
    const paddedNumber = String(newSerialNumber).padStart(3, '0');
    return `APF ${paddedNumber}`;
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

  const handleJobCardSelect = (jobCardId) => {
    const selectedCard = jobCardOptions.find(card => card.id === jobCardId);
    if (selectedCard) {
      setSelectedJobCard(selectedCard);
      setFormData(prev => ({
        ...prev,
        carMake: selectedCard.carMake || "",
        otherCarMake: selectedCard.otherCarMake || "",
        variant: selectedCard.variant || "",
        registrationNo: selectedCard.registrationNo || "",
        isUnregistered: selectedCard.isUnregistered || false,
        unregisteredSerialNo: selectedCard.unregisteredSerialNo || "",
      }));

      if (selectedCard.carMake) {
        setVariants(carMakes[selectedCard.carMake] || []);
      }
    }
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
      const newExit = {
        ...formData,
        srNo: uniqueSrNo,
        exitTime: now.toISOString(),
        relatedJobCardId: selectedJobCard?.id || null,
        relatedJobCardSrNo: selectedJobCard?.srNo || null
      };

      await setDoc(doc(db, "ExitGuard", uniqueSrNo), newExit);
      alert("Exit Guard form submitted successfully!");


      // Show success notification
      const notification = document.getElementById("notification");
      notification.textContent = "Exit record submitted successfully!";
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

      setSelectedJobCard(null);
      fetchExitRecords(); // Refresh exit records
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
    <div className="min-h-screen bg-gray-50">

      <div id="notification" className="fixed top-4 right-4 opacity-0 transition-opacity duration-500"></div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 my-20">

        {/* Tabs for switching between Form and Table views */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setViewMode("form")}
            className={`flex items-center px-4 py-2 rounded-md ${viewMode === "form" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors duration-200`}
          >
            <FileCheck className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Record Exit</span>
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
                <Shield className="w-6 h-6 mr-2" />
                Exit Guard Record
              </h2>
              <p className="text-green-100 text-sm mt-1">Record a vehicle exit from the facility</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Serial Number */}
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Exit Serial Number
                </label>
                <input
                  type="text"
                  name="srNo"
                  value={formData.srNo}
                  readOnly
                  className="w-full px-4 py-2 bg-white border border-green-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>


              {/* Related Job Card Selection */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <File className="w-5 h-5 mr-2 text-blue-600" />
                  Related Entry Record
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Entry Job Card (Optional)</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    onChange={(e) => handleJobCardSelect(e.target.value)}
                    value={selectedJobCard?.id || ""}
                  >
                    <option value="">-- Select Related Entry Card --</option>
                    {jobCardOptions.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.srNo} - {card.carMake} {card.variant} - {card.registrationNo || card.unregisteredSerialNo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exit Guard Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Exit Guard Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Guard Name</label>
                    <input
                      type="text"
                      name="exitGuardName"
                      placeholder="Enter guard name"
                      value={formData.exitGuardName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Registration Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    name="registrationNo"
                    placeholder="Enter registration number"
                    value={formData.registrationNo}
                    onChange={handleChange}
                    required={!formData.isUnregistered}
                    disabled={formData.isUnregistered}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
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

                {/* Gate Pass Information */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Gate Pass Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Gate Pass Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gate Pass Number</label>
                      <input
                        type="text"
                        name="gatePassNumber"
                        placeholder="Enter gate pass number"
                        value={formData.gatePassNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Temp Gate Pass Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temp Gate Pass Number</label>
                      <input
                        type="text"
                        name="tempGatePassNumber"
                        placeholder="Enter temporary gate pass number"
                        value={formData.tempGatePassNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Manual Gate Pass Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manual Gate Pass Number</label>
                      <input
                        type="text"
                        name="manualGatePassNumber"
                        placeholder="Enter manual gate pass number"
                        value={formData.manualGatePassNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialData);
                    setSelectedJobCard(null);
                  }}
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
              <p className="text-white text-sm mt-1">View and search all exit records</p>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Exit Records Table */}
            <div className="p-4">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[800px] divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Sr No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Guard</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Make</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gate Pass No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExitRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-10 text-center text-sm text-gray-500">
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
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.srNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.exitGuardName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.carMake}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.registrationNo || record.unregisteredSerialNo}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.gatePassNumber || record.tempGatePassNumber || record.manualGatePassNumber || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.exitDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ExitGuard;
