"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../utilis/firebaseConfig";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import Footer from "../../components/Footer/Footer";
import { FileCheck, List } from "lucide-react";
import ServiceRecordsTable from "./ServiceRecordsTable"



import {
  Wrench,
  Car,
  Hammer,
  Paintbrush,
  User,
  Phone,
  Calendar,
  Check,
  FileText,
  Settings,
  Smile,
  Brush,
  Zap,
  ClipboardCheck,
  Axe,
  Shield,
  CreditCard

} from "lucide-react";


const JobCardCollection = () => {
  const getCurrentDateTime = () => new Date().toISOString().slice(0, 16);

  // Store the initial state separately
  const initialData = {
    mechanicalJob: {
      bayNumber: "",
      bayInTime: getCurrentDateTime(),
      serviceType: "",
      otherJobDetails: "",
      jobCardNumber: "",
      customerName: "",
      customerContact1: "",
      customerContact2: "",
      serviceAdvisorName: "",
      technicianName: "",
      juniorTechName: "",
      bayOutTime: getCurrentDateTime(),
      testDrive: "",
      testDriveDetails: {
        bayInTime: getCurrentDateTime(),
        technicianName: "",
        bayOutTime: getCurrentDateTime(),
      },
    },
    bodyshopJob: {

      dateAndTimeOfApproval: getCurrentDateTime(),

    },
    dentingJob: {

      denterBay: "",
      bayInTime: getCurrentDateTime(),
      jobCardNumber: "",
      customerName: "",
      customerContact1: "",
      customerContact2: "",
      denterName: "",
      fitterName: "",
      totalPanels: "",
      panelsUnderRepair: "",
      panelsUnderReplacement: "",
      bayOutTime: getCurrentDateTime(),
    },
    groundingJob: {
      bayInTime: getCurrentDateTime(),
      color: "",
      grounderName: "",
      numberOfPanels: "",
      bayOutTime: getCurrentDateTime(),
    },
    paintJob: {
      bayInTime: getCurrentDateTime(),
      typeOfPaint: "",
      painterName: "",
      numberOfPanels: "",
      bayOutTime: getCurrentDateTime(),
    },
    finalFitting: {
      bayInTime: getCurrentDateTime(),
      numberOfPanels: "",
      fitterName: "",
      bayOutTime: getCurrentDateTime(),
    },
    finalPolishing: {
      bayInTime: getCurrentDateTime(),
      numberOfPanels: "",
      polisherName: "",
      bayOutTime: getCurrentDateTime(),
    },
    finalInspection: {
      inspectorName: "",
      inspectionDate: getCurrentDateTime(),
      paymentType: "",
    },
  };

  const [showData, setShowData] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [fetchedData, setFetchedData] = useState([]);
  const [mechanicalChecked, setMechanicalChecked] = useState(false);
  const [bodyShopChecked, setBodyShopChecked] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("form");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("default", { month: "short" }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedJobCard, setSelectedJobCard] = useState(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const handleFormSubmit = async (data) => {


    try {
      // Use currently selected filters for update paths to ensure we write to the same collection that was loaded
      const year = selectedYear;
      const month = selectedMonth;

      const uniqueJobCardID = `${year}-${month}-${Date.now()}`;

      await setDoc(doc(db, `JobController/${year}/${month}`, uniqueJobCardID), data);

      alert("Job Card Created Successfully!");
    } catch (error) {
      console.error("Error creating job card: ", error);
      alert("Failed to create job card!");
    } finally {
      setIsSubmitting(false); // Hide loader after submission
    }
  };


  // Reset Form Function
  const handleReset = () => {
    setFormData(initialData);
    setSelectedJobCard(null);
  };

  const fetchJobControllerData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, `JobController/${selectedYear}/${selectedMonth}`));
      const jobCards = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      console.log("📌 Firebase Query Snapshot: ", querySnapshot);
      console.log("jobCards ", jobCards);

      if (jobCards.length > 0) {
        setFetchedData(jobCards);
        setShowData(true);
      } else {
        console.log("⚠️ No job records found.");
        setFetchedData([]);
        setShowData(false);
      }
    } catch (error) {
      console.error("❌ Error fetching job controller data:", error);
    }
  };

  console.log("fetchedData", fetchedData)

  const showJobForm = () => {

    setShowForm(true);
    setShowData(false);
  };

  const handleChange = (e, category = null) => {
    const { name, value } = e.target;

    // Job Card Number Auto-Formatting (NN/NNNNN)
    if (name === "jobCardNumber") {
      let formattedValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters

      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 7)}`; // Auto-insert "/"
      }

      if (formattedValue.length > 8) {
        return; // Prevent exceeding "NN/NNNNN"
      }

      if (category) {
        setFormData((prev) => ({
          ...prev,
          [category]: { ...prev[category], [name]: formattedValue },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: formattedValue,
        }));
      }
      return;
    }

    // For all other inputs
    if (category) {
      setFormData((prev) => ({
        ...prev,
        [category]: { ...prev[category], [name]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();



    setIsSubmitting(true);

    try {
      const year = new Date().getFullYear().toString();
      const month = new Date().toLocaleString("default", { month: "short" });

      const jobCardsRef = collection(db, `JobController/${year}/${month}`);
      const querySnapshot = await getDocs(jobCardsRef);
      const existingJobCards = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Get job card numbers from formData
      const mechanicalJobNumber = mechanicalChecked ? formData.mechanicalJob?.jobCardNumber?.trim() : null;
      const bodyShopJobNumber = bodyShopChecked ? formData.dentingJob?.jobCardNumber?.trim() : null;

      if (!mechanicalJobNumber && !bodyShopJobNumber) {
        alert("⚠️ Please enter a Job Card Number before submitting.");
        setIsSubmitting(false);
        return;
      }

      // Check for duplicate job card numbers only when creating new
      if (!selectedJobCard) {
        const isDuplicate = existingJobCards.some(job =>
          (mechanicalJobNumber && job?.mechanicalJob?.jobCardNumber?.trim() === mechanicalJobNumber) ||
          (bodyShopJobNumber && job?.dentingJob?.jobCardNumber?.trim() === bodyShopJobNumber)
        );
        console.log("isDuplicate", isDuplicate)
        if (isDuplicate) {
          alert(`❌ Job Card Number already exists! Please use a unique Job Card Number.`);
          setIsSubmitting(false);
          return;
        }
      }

      // Create new or update existing depending on edit mode
      if (selectedJobCard) {
        await setDoc(doc(db, `JobController/${year}/${month}`, selectedJobCard), formData, { merge: true });
        alert("✅ Job Card Updated Successfully!");
      } else {
        const uniqueJobCardID = `${new Date().getFullYear().toString()}-${new Date().toLocaleString("default", { month: "short" })}-${Date.now()}`;
        await setDoc(doc(db, `JobController/${year}/${month}`, uniqueJobCardID), formData);
        alert("✅ Job Card Created Successfully!");
      }
      fetchJobControllerData(); // Refresh the job records
      setShowForm(false);
      setSelectedJobCard(null);
    } catch (error) {
      console.error("❌ Error creating job card: ", error);
      alert("⚠️ Failed to create job card!");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      <div className="flex  justify-center min-h-screen  my-24">
        <div className="max-w-7xl  w-full bg-white shadow-lg rounded-lg overflow-hidden ">

          <div className="p-2 flex items-start gap-2  bg-gray-50 rounded-lg shadow-lg   my-4">

            {/* Create Job Controller Button (Left Side) */}

            <button
              onClick={() => {
                setViewMode("form"); // Set the view mode
                showJobForm(); // Show the form
              }}
              className={`flex items-center px-4 py-2 rounded-md ${viewMode === "form" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-300"
                } transition-colors duration-200`}
            >
              <FileCheck className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Create Job Card</span>
              <span className="sm:hidden">New</span>
            </button>


            {/* View Job Controller Records Button (Right Side) */}
            <button
              onClick={() => {
                setViewMode("table"); // Set view mode
                fetchJobControllerData(); // Fetch data
              }}
              className={`flex items-center px-4 py-2 rounded-md ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-colors duration-200`}
            >
              <List className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">View Job Records</span>
              <span className="sm:hidden">View</span>
            </button>

          </div>

          {/* Header with Blue Gradient */}
          {!showData && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <Settings className="w-6 h-6 mr-2" />
                Job Controller
              </h2>
              <p className="text-white text-sm mt-1">Manage job categories and assignments</p>

            </div>

          )}

          {!showData && (
            <>

              {/* Mechanical & Body Shop Checkboxes */}
              <div className="flex items-center space-x-4 my-4 ml-5">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={mechanicalChecked}
                    onChange={() => {
                      setMechanicalChecked(true);
                      setBodyShopChecked(false);
                    }}
                  />
                  <span className="text-md font-medium flex items-center">
                    <Wrench className="mr-1" /> Mechanical
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={bodyShopChecked}
                    onChange={() => {
                      setBodyShopChecked(true);
                      setMechanicalChecked(false);
                    }}
                  />
                  <span className="text-md font-medium flex items-center">
                    <Car className="mr-1" /> Body Shop
                  </span>
                </label>
              </div>


            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">


            {!showData && (
              <>

                {/* Mechanical Job Fields */}
                {mechanicalChecked && (
                  <div className="border border-gray-300 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Wrench className="mr-2" /> Mechanical Job
                    </h3>
                    <div className="space-y-4">

                      <div className="flex items-center space-x-2">
                        <FileText className="text-gray-500" />
                        <input
                          type="text"
                          name="bayNumber"
                          placeholder="Enter Bay #"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob")}
                          required
                          value={formData.mechanicalJob.bayNumber}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="text-gray-500" />
                        <input
                          type="datetime-local"
                          name="bayInTime"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob")}
                          value={formData.mechanicalJob.bayInTime}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Axe className="text-gray-500" />
                        <select
                          name="serviceType"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob")}
                          required
                          value={formData.mechanicalJob.serviceType}
                        >
                          <option value="">Select service type</option>
                          {[
                            "Periodic Maintenance",
                            "FFI",
                            "SFI",
                            "Engine Oil + Oil Filter Change",
                            "Engine Tune-Up",
                            "Brake Service",
                            "Wheel Balancing",
                            "Wheel Alignment",
                            "Tyre Change",
                            "Wheel Bearing Replacement",
                            "General Checkup",
                            "Front Suspension Work",
                            "Rear Suspension Work",
                            "Shock Absorber Replacement",
                            "Engine Overhauling",
                            "Head Overhauling",
                            "Transmission Oil Change",
                            "Differential Oil Change",
                            "Differential Opening / Refitting",
                            "Axle Opening / Refitting",
                            "Center Bush Replacement",
                            "Radiator Opening Fitting",
                            "Electrical Checkup",
                            "Battery Replacement",
                            "A/C Check-Up",
                            "A/C Servicing",
                            "New A/C Fitting",
                            "Coolant Change",
                            "Clutch Maintenance Job",
                            "Gear Opening / Fitting",
                            "Front-Wheel Disc Pad Replacement",
                            "Rear Wheel Disc / Drum Replacement",
                            "Wheel Disc Plates Tooling",
                            "Carburetor Service",
                            "Throttle Body Service",
                            "Catalytic Converter Cleaning",
                            "Timing Opening / Refitting",
                            "Water Pump Opening / Refitting",
                            "AGS Actuator Assy Opening / Refitting",
                            "Other Jobs"
                          ].map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* ✅ Display input field only if "Other Jobs" is selected */}
                      {formData.mechanicalJob.serviceType === "Other Jobs" && (
                        <div className="flex items-center space-x-2 mt-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="text"
                            name="otherJobDetails"
                            placeholder="Further Detail of Job"
                            className="input"
                            onChange={(e) => handleChange(e, "mechanicalJob")}
                            value={formData.mechanicalJob.otherJobDetails || ""}
                          />
                        </div>
                      )}



                      <div className="flex items-center space-x-2">
                        <ClipboardCheck className="text-gray-500" />
                        <input
                          type="text"
                          name="jobCardNumber"
                          placeholder="Job Card # (NN/NNNNN)"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob")}
                          value={formData.mechanicalJob.jobCardNumber}
                          maxLength={8} // Ensures max length "NN/NNNNN"
                        />
                      </div>


                      <div className="flex items-center space-x-2">
                        <User className="text-gray-500" />
                        <input
                          type="text"
                          name="customerName"
                          placeholder="Customer Name"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob")}
                          value={formData.mechanicalJob.customerName}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="text-gray-500" />
                        <input
                          type="text"
                          name="customerContact1"
                          placeholder="Customer Contact # 1"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob", "customerContact1")}
                          value={formData.mechanicalJob.customerContact1 || ""}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="text-gray-500" />
                        <input
                          type="text"
                          name="customerContact2"
                          placeholder="Customer Contact # 2"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob", "customerContact2")}
                          value={formData.mechanicalJob.customerContact2 || ""}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="text-gray-500" />
                        <input
                          type="text"
                          name="serviceAdvisorName"
                          placeholder="Name of Service Advisor"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob", "serviceAdvisorName")}
                          value={formData.mechanicalJob.serviceAdvisorName || ""}
                        />
                      </div>


                      <div className="flex items-center space-x-2">
                        <User className="text-gray-500" />
                        <input
                          type="text"
                          name="technicianName"
                          placeholder="Name of Technician"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob")}
                          value={formData.mechanicalJob.technicianName}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="text-gray-500" />
                        <input
                          type="text"
                          name="juniorTechName"
                          placeholder="Name of Junior Tech"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob")}
                          value={formData.mechanicalJob.juniorTechName}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="text-gray-500" />
                        <input
                          type="datetime-local"
                          name="bayOutTime"
                          className="input"
                          onChange={(e) => handleChange(e, "mechanicalJob")}
                          value={formData.mechanicalJob.bayOutTime}
                        />
                      </div>


                      {/* Re-inspection Check */}
                      <div className="mt-4">
                        <h4 className="text-md font-semibold flex items-center">
                          <Shield className="mr-2" /> Is re-inspection required?
                        </h4>
                        <div className="flex space-x-4 mt-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="reInspection"
                              value="No"
                              checked={formData.finalPolishing.reInspection === "No"}
                              onChange={(e) => handleChange(e, "finalPolishing")}
                            />
                            <span>No</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="reInspection"
                              value="Yes"
                              checked={formData.finalPolishing.reInspection === "Yes"}
                              onChange={(e) => handleChange(e, "finalPolishing")}
                            />
                            <span>Yes</span>
                          </label>
                        </div>
                      </div>
                      {/* If "No", show Final Inspector details */}
                      {formData.finalPolishing.reInspection === "No" && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <User className="text-gray-500" />
                            <input
                              type="text"
                              name="inspectorName"
                              placeholder="Final Inspector Name"
                              className="input"
                              onChange={(e) => handleChange(e, "finalInspection")}
                              value={formData.finalInspection.inspectorName}
                            />
                          </div>

                          <div className="flex items-center space-x-2 mt-2">
                            <Calendar className="text-gray-500" />
                            <input
                              type="datetime-local"
                              name="inspectionDate"
                              className="input"
                              onChange={(e) => handleChange(e, "finalInspection")}
                              value={formData.finalInspection.inspectionDate}
                            />
                          </div>

                          {/* <div className="flex items-center space-x-2 mt-2">
                            <CreditCard className="text-gray-500" />
                            <select
                              name="paymentType"
                              className="input"
                              onChange={(e) => handleChange(e, "finalInspection")}
                              value={formData.finalInspection.paymentType}
                            >
                              <option value="">Select Payment Type</option>
                              <option value="Cash">Cash</option>
                              <option value="Card">insurance</option>
                              <option value="Online">cash + insurance</option>
                            </select>
                          </div> */}
                        </div>
                      )}

                      {/* If "Yes", redirect to another page for re-inspection */}
                      {formData.finalPolishing.reInspection === "Yes" && (
                        <div className="mt-4">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
                            onClick={() => window.location.href = "/pages/job-controller"} // Change to your re-inspection page
                          >
                            Proceed to Re-Inspection
                          </button>
                        </div>
                      )}


                    </div>
                  </div>
                )}
              </>
            )}

            {/* Body Shop Fields */}
            {bodyShopChecked && (
              <>


                {!showData && (
                  <>
                    {/* Body Shop Heading */}
                    <div className="border border-gray-300 p-4 rounded-lg mt-6">



                      <h3 className="text-xl font-semibold flex items-center">
                        <Car className="mr-2 font-bold" /> Body Shop Work
                      </h3>


                      <div className="my-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2 ml-8">Date and Time of Approval</h2>
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="dateAndTimeOfApproval"
                            className="input"
                            onChange={(e) => handleChange(e, "bodyshopJob")}
                            value={formData.bodyshopJob.dateAndTimeOfApproval}
                          />
                        </div>
                      </div>

                    </div>

                  </>
                )}

                {!showData && (
                  <>

                    {/* Denting Job */}
                    <div className="border border-gray-300 p-4 rounded-lg mt-4">
                      <h4 className="text-md font-semibold flex items-center">
                        <Hammer className="mr-2" /> Denting Job
                      </h4>
                      <div className="space-y-4">

                        <div className="flex items-center space-x-2 mt-2">
                          <CreditCard className="text-gray-500" />
                          <select
                            name="paymentType"
                            className="input"
                            onChange={(e) => handleChange(e, "finalInspection")}
                            value={formData.finalInspection.paymentType}
                          >
                            <option value="">Select Payment Type</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">insurance</option>
                            <option value="Online">cash + insurance</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="text"
                            name="denterBay"
                            placeholder="Enter Denter's Bay #"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            value={formData.dentingJob.denterBay}
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayInTime"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            value={formData.dentingJob.bayInTime}
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClipboardCheck className="text-gray-500" />
                          <input
                            type="text"
                            name="jobCardNumber"
                            placeholder="Job Card # (NN/NNNNN)"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            value={formData.dentingJob.jobCardNumber}
                            maxLength={8} // Ensures max length "NN/NNNNN"
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="text-gray-500" />
                          <input
                            type="text"
                            name="customerName"
                            placeholder="Customer Name"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            required
                            value={formData.dentingJob.customerName}
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="text-gray-500" />
                          <input
                            type="text"
                            name="customerContact1"
                            placeholder="Customer Contact # 1"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            value={formData.dentingJob.customerContact1}
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="text-gray-500" />
                          <input
                            type="text"
                            name="customerContact2"
                            placeholder="Customer Contact # 2"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            value={formData.dentingJob.customerContact2}
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="text-gray-500" />
                          <input
                            type="text"
                            name="denterName"
                            placeholder="Name of Denter"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            value={formData.dentingJob.denterName}
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="text-gray-500" />
                          <input
                            type="text"
                            name="fitterName"
                            placeholder="Name of Fitter"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            value={formData.dentingJob.fitterName}
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="number"
                            name="totalPanels"
                            placeholder="Total Panels (numeric only)"
                            className="input"
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                              handleChange({ target: { name: "totalPanels", value } }, "dentingJob");
                            }}
                            value={formData.dentingJob.totalPanels}
                            min="0"
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="number"
                            name="panelsUnderRepair"
                            placeholder="Panels Under Repair (numeric only)"
                            className="input"
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                              handleChange({ target: { name: "panelsUnderRepair", value } }, "dentingJob");
                            }}
                            value={formData.dentingJob.panelsUnderRepair}
                            min="0"
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="number"
                            name="panelsUnderReplacement"
                            placeholder="Panels Under Replacement (numeric only)"
                            className="input"
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                              handleChange({ target: { name: "panelsUnderReplacement", value } }, "dentingJob");
                            }}
                            value={formData.dentingJob.panelsUnderReplacement}
                            min="0"
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayOutTime"
                            className="input"
                            onChange={(e) => handleChange(e, "dentingJob")}
                            value={formData.dentingJob.bayOutTime}
                            disabled={Boolean(selectedJobCard)}
                          />
                        </div>


                      </div>

                    </div>
                  </>
                )}

                {!showData && (
                  <>
                    {/* Grounding Job */}
                    <div className="border border-gray-300 p-4 rounded-lg mt-4">
                      <h4 className="text-md font-semibold flex items-center">
                        <Zap className="mr-2" /> Grounding Job
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayInTime"
                            className="input"
                            onChange={(e) => handleChange(e, "groundingJob")}
                            value={formData.groundingJob.bayInTime}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="number"
                            name="numberOfPanels"
                            placeholder="Number of Panels (numeric only)"
                            className="input"
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                              handleChange({ target: { name: "numberOfPanels", value } }, "groundingJob");
                            }}
                            value={formData.groundingJob.numberOfPanels}
                            min="0"
                          />
                        </div>
                        {/* Color Input */}
                        <div className="flex items-center space-x-2">
                          <Brush className="text-gray-500" />
                          <input
                            type="text"
                            name="color"
                            placeholder="Enter Color"
                            className="input"
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, ""); // Allow only alphanumeric
                              handleChange({ target: { name: "color", value } }, "groundingJob");
                            }}
                            value={formData.groundingJob.color}
                          />

                        </div>




                        <div className="flex items-center space-x-2">
                          <User className="text-gray-500" />
                          <input
                            type="text"
                            name="grounderName"
                            placeholder="Name of Grounder"
                            className="input"
                            onChange={(e) => handleChange(e, "groundingJob")}
                            value={formData.groundingJob.grounderName}
                          />
                        </div>


                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayOutTime"
                            className="input"
                            onChange={(e) => handleChange(e, "groundingJob")}
                            value={formData.groundingJob.bayOutTime}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!showData && (
                  <>
                    {/* Paint Job */}
                    <div className="border border-gray-300 p-4 rounded-lg mt-4">
                      <h4 className="text-md font-semibold flex items-center">
                        <Paintbrush className="mr-2" /> Paint Job
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayInTime"
                            className="input"
                            onChange={(e) => handleChange(e, "paintJob")}
                            value={formData.paintJob.bayInTime}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Brush className="text-gray-500" />
                          <select
                            name="typeOfPaint"
                            className="input px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => handleChange(e, "paintJob")}
                            value={formData.paintJob.typeOfPaint}
                          >
                            <option value="">Select Type of Paint</option>
                            <option value="Solid">Solid</option>
                            <option value="Metallic">Metallic</option>
                            <option value="Pearl">Pearl</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <User className="text-gray-500" />
                          <input
                            type="text"
                            name="painterName"
                            placeholder="Name of Painter"
                            className="input"
                            onChange={(e) => handleChange(e, "paintJob")}
                            value={formData.paintJob.painterName}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="text"
                            name="numberOfPanels"
                            placeholder="Number of Panels (numeric only)"
                            className="input"
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                              handleChange({ target: { name: "numberOfPanels", value } }, "paintJob");
                            }}
                            value={formData.paintJob.numberOfPanels}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayOutTime"
                            className="input"
                            onChange={(e) => handleChange(e, "paintJob")}
                            value={formData.paintJob.bayOutTime}
                          />
                        </div>
                      </div>
                    </div>

                  </>
                )}

                {!showData && (
                  <>
                    {/* Final Fitting */}
                    <div className="border border-gray-300 p-4 rounded-lg mt-4">
                      <h4 className="text-md font-semibold flex items-center">
                        <Axe className="mr-2" /> Final Fitting
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayInTime"
                            className="input"
                            onChange={(e) => handleChange(e, "finalFitting")}
                            value={formData.finalFitting.bayInTime}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="text"
                            name="numberOfPanels"
                            placeholder="Number of Panels (numeric only)"
                            className="input"
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                              handleChange({ target: { name: "numberOfPanels", value } }, "finalFitting");
                            }}
                            value={formData.finalFitting.numberOfPanels}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <User className="text-gray-500" />
                          <input
                            type="text"
                            name="fitterName"
                            placeholder="Name of Fitter"
                            className="input"
                            onChange={(e) => handleChange(e, "finalFitting")}
                            value={formData.finalFitting.fitterName}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayOutTime"
                            className="input"
                            onChange={(e) => handleChange(e, "finalFitting")}
                            value={formData.finalFitting.bayOutTime}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!showData && (
                  <>
                    {/* Final Polishing */}
                    <div className="border border-gray-300 p-4 rounded-lg mt-4">
                      <h4 className="text-md font-semibold flex items-center">
                        <Smile className="mr-2" /> Final Polishing
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayInTime"
                            className="input"
                            onChange={(e) => handleChange(e, "finalPolishing")}
                            value={formData.finalPolishing.bayInTime}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="text-gray-500" />
                          <input
                            type="text"
                            name="numberOfPanels"
                            placeholder="Number of Panels (numeric only)"
                            className="input"
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                              handleChange({ target: { name: "numberOfPanels", value } }, "finalPolishing");
                            }}
                            required
                            value={formData.finalPolishing.numberOfPanels}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <User className="text-gray-500" />
                          <input
                            type="text"
                            name="polisherName"
                            placeholder="Name of Polisher"
                            className="input"
                            onChange={(e) => handleChange(e, "finalPolishing")}
                            required
                            value={formData.finalPolishing.polisherName}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-gray-500" />
                          <input
                            type="datetime-local"
                            name="bayOutTime"
                            className="input"
                            onChange={(e) => handleChange(e, "finalPolishing")}
                            value={formData.finalPolishing.bayOutTime}
                          />
                        </div>
                      </div>


                      {/* Re-inspection Check */}
                      <div className="mt-4">
                        <h4 className="text-md font-semibold flex items-center">
                          <Shield className="mr-2" /> Is re-inspection required?
                        </h4>
                        <div className="flex space-x-4 mt-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="reInspection"
                              value="No"
                              checked={formData.finalPolishing.reInspection === "No"}
                              onChange={(e) => handleChange(e, "finalPolishing")}
                            />
                            <span>No</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="reInspection"
                              value="Yes"
                              checked={formData.finalPolishing.reInspection === "Yes"}
                              onChange={(e) => handleChange(e, "finalPolishing")}
                            />
                            <span>Yes</span>
                          </label>
                        </div>
                      </div>

                      {/* If "No", show Final Inspector details */}
                      {formData.finalPolishing.reInspection === "No" && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <User className="text-gray-500" />
                            <input
                              type="text"
                              name="inspectorName"
                              placeholder="Final Inspector Name"
                              className="input"
                              onChange={(e) => handleChange(e, "finalInspection")}
                              value={formData.finalInspection.inspectorName}
                            />
                          </div>

                          <div className="flex items-center space-x-2 mt-2">
                            <Calendar className="text-gray-500" />
                            <input
                              type="datetime-local"
                              name="inspectionDate"
                              className="input"
                              onChange={(e) => handleChange(e, "finalInspection")}
                              value={formData.finalInspection.inspectionDate}
                            />
                          </div>
                        </div>
                      )}

                      {/* If "Yes", redirect to another page for re-inspection */}
                      {formData.finalPolishing.reInspection === "Yes" && (
                        <div className="mt-4">
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
                            onClick={() => window.location.href = "/pages/job-controller"} // Change to your re-inspection page
                          >
                            Proceed to Re-Inspection
                          </button>
                        </div>
                      )}
                    </div>

                  </>
                )}
              </>
            )}

          </form>

          {!showData && (

            <>
              {/* Action Buttons Container */}
              <div className="my-4 flex items-center justify-end space-x-4 mr-4">
                {/* Reset Button */}
                <button
                  type="button"
                  className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center justify-center"
                  onClick={() => {
                    setFormData(initialData);
                    setSelectedJobCard(null);
                  }}
                >
                  <Check className="mr-2" /> Reset
                </button>
                {/* Submit Button */}
                <button
                  type="submit"
                  onClick={handleSubmit}
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
                      <Check className="mr-2" /> Submitting...
                    </>
                  ) : (
                    "Submit Job Record"
                  )}
                </button>

              </div>
            </>
          )}





          {/* Display Fetched Data in Table */}
          {viewMode === "table" && (
            <>
              {/* Month-Year Filter */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-end">
                  <div className="flex flex-wrap gap-2">
                    <div className="relative inline-block w-32">
                      <select
                        value={selectedMonth}
                        onChange={(e) => {
                          setSelectedMonth(e.target.value);
                          fetchJobControllerData();
                        }}
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
                        onChange={(e) => {
                          setSelectedYear(e.target.value);
                          fetchJobControllerData();
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={fetchJobControllerData}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
              <ServiceRecordsTable
                fetchedData={fetchedData}
                onEdit={(record) => {
                  const merged = {
                    ...initialData,
                    ...record,
                    mechanicalJob: { ...initialData.mechanicalJob, ...(record.mechanicalJob || {}) },
                    bodyshopJob: { ...initialData.bodyshopJob, ...(record.bodyshopJob || {}) },
                    dentingJob: { ...initialData.dentingJob, ...(record.dentingJob || {}) },
                    groundingJob: { ...initialData.groundingJob, ...(record.groundingJob || {}) },
                    paintJob: { ...initialData.paintJob, ...(record.paintJob || {}) },
                    finalFitting: { ...initialData.finalFitting, ...(record.finalFitting || {}) },
                    finalPolishing: { ...initialData.finalPolishing, ...(record.finalPolishing || {}) },
                    finalInspection: { ...initialData.finalInspection, ...(record.finalInspection || {}) },
                  };
                  setFormData(merged);
                  setSelectedJobCard(record.id);
                  setBodyShopChecked(true);
                  setMechanicalChecked(false);
                  setViewMode("form");
                  setShowForm(true);
                  setShowData(false);
                }}
              />
            </>
          )}


        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobCardCollection;
