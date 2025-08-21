"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../../utilis/firebaseClient";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Receipt, Clock, Wallet, Award, Gift, FileText, X, Check, AlertTriangle, List, Search } from "lucide-react";

const FinanceForm = () => {
  const initialState = {
    invoiceNumber: "",
    receiptNumber: "",
    closingTime: new Date().toISOString().slice(11, 16), // Get current time in HH:MM format
    paymentMethod: "Cash",
    invoiceAmount: "",
    amountReceived: "",
    loyaltyRedemption: "",
    otherRedemption: "",
    redemptionDetails: "",
    noWorkDone: false,
  };

  const [formData, setFormData] = useState(initialState);

  const [financeRecords, setFinanceRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("form"); // "form" or "table"
  const [errors, setErrors] = useState({});
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      closingTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    }));
    fetchFinanceRecords();
  }, [selectedMonth, selectedYear]);

  const fetchFinanceRecords = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "finance", selectedYear, selectedMonth));
      const records = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFinanceRecords(records);
    } catch (error) {
      console.error("Error fetching finance records:", error);
    }
  };

  console.log("financeRecords", financeRecords)

  const filteredRecords = useMemo(() => {
    const q = (searchQuery || "").toString().toLowerCase().trim();
    if (!q) return financeRecords;

    return financeRecords.filter((record) => {
      const toNum = (value) => {
        if (typeof value === "number") return Number.isFinite(value) ? value : 0;
        if (typeof value === "string") {
          const parsed = parseFloat(value.replace(/,/g, "").trim());
          return Number.isFinite(parsed) ? parsed : 0;
        }
        return 0;
      };

      const invoice = toNum(record?.invoiceAmount);
      const received = toNum(record?.amountReceived);
      const loyalty = toNum(record?.loyaltyRedemptionAmount ?? record?.loyaltyRedemption);
      const other = toNum(record?.otherRedemptionAmount ?? record?.otherRedemption);
      const derivedRemaining = invoice - (received + loyalty + other);

      const fields = [
        record.invoiceNumber,
        record.receiptNumber,
        record.paymentMethod,
        record.loyaltyRedemption,
        record.otherRedemption,
        record.redemptionDetails,
        record.closingTime,
        record.noWorkDone ? "yes" : "no",
        record.invoiceAmount,
        record.amountReceived,
        record.remainingAmount,
        derivedRemaining,
      ];

      return fields
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((v) => v.includes(q));
    });
  }, [searchQuery, financeRecords]);

  const toNumber = (value) => {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : 0;
  };

  const toNumberFlexible = (value) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/,/g, "").trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const deriveInvoiceFromRecord = (record) => {
    const invoice = toNumberFlexible(record?.invoiceAmount);
    const received = toNumberFlexible(record?.amountReceived);
    const loyalty = toNumberFlexible(record?.loyaltyRedemptionAmount ?? record?.loyaltyRedemption);
    const other = toNumberFlexible(record?.otherRedemptionAmount ?? record?.otherRedemption);
    const remaining = Number.isFinite(record?.remainingAmount)
      ? Number(record.remainingAmount)
      : (invoice - (received + loyalty + other));
    const derived = received + loyalty + other + (Number.isFinite(remaining) ? remaining : 0);
    return invoice || (derived || null);
  };

  const calculatedRemainingAmount = useMemo(() => {
    const invoiceAmountNum = toNumber(formData.invoiceAmount);
    const amountReceivedNum = toNumber(formData.amountReceived);
    const loyaltyNum = toNumber(formData.loyaltyRedemption);
    const otherNum = toNumber(formData.otherRedemption);
    return invoiceAmountNum - (amountReceivedNum + loyaltyNum + otherNum);
  }, [formData.invoiceAmount, formData.amountReceived, formData.loyaltyRedemption, formData.otherRedemption]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.noWorkDone) {
      if (!formData.invoiceNumber) {
        newErrors.invoiceNumber = "Invoice number is required";
      } else if (!/^\d+$/.test(formData.invoiceNumber)) {
        newErrors.invoiceNumber = "Invoice number must contain only numbers";
      }

      if (!formData.receiptNumber) {
        newErrors.receiptNumber = "Receipt number is required";
      } else if (!/^\d+$/.test(formData.receiptNumber)) {
        newErrors.receiptNumber = "Receipt number must contain only numbers";
      }

      if (!formData.closingTime) {
        newErrors.closingTime = "Closing time is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if "No Work Done" is selected
    if (formData.noWorkDone) {
      alert("Submission is disabled because 'No Work Done' is selected.");
      return;
    }

    // Validate the form first
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Ensure two-digit month

      const payload = {
        ...formData,
        invoiceAmount: toNumber(formData.invoiceAmount),
        amountReceived: toNumber(formData.amountReceived),
        // Keep redemptions as originally entered (may be text); also provide numeric versions for reporting
        loyaltyRedemptionAmount: toNumber(formData.loyaltyRedemption),
        otherRedemptionAmount: toNumber(formData.otherRedemption),
        remainingAmount: calculatedRemainingAmount,
        createdAt: now.toISOString(),
      };

      await addDoc(collection(db, "finance", year, month), payload);
      alert("Finance form submitted successfully!");

      // Reset the form fields after successful submission
      setFormData({
        invoiceNumber: "",
        receiptNumber: "",
        closingTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        paymentMethod: "Cash",
        invoiceAmount: "",
        amountReceived: "",
        loyaltyRedemption: "",
        otherRedemption: "",
        redemptionDetails: "",
        noWorkDone: false,
      });

      fetchFinanceRecords(); // Refresh finance records after submission
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Failed to submit form.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className=" min-h-screen bg-gray-50">
      <div className="md:max-w-7xl max-w-md  mx-auto p-6 my-24 ">
        {/* Tabs for switching views */}
        <div className="flex space-x-2  bg-white rounded-lg shadow p-2 ">
          <button
            onClick={() => setViewMode("form")}
            className={`flex items-center px-4 py-2 rounded-md ${viewMode === "form" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors duration-200`}
          >
            <FileText className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline"> Create Finance Form </span>
            <span className="sm:hidden">New</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center px-4 py-2 rounded-md ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors duration-200`}
          >
            <List className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">  View Records </span>
            <span className="sm:hidden">View</span>
          </button>
        </div>

        {viewMode === "form" ? (
          <div className="max-w-2xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-5 border border-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Financial Details
              </h2>
              <p className="text-blue-100 text-sm mt-1">Submit financial information for the current job</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* No Work Done Banner */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-gray-200 mr-3">
                    <input
                      type="checkbox"
                      id="noWorkDone"
                      name="noWorkDone"
                      checked={formData.noWorkDone}
                      onChange={handleChange}
                      className="w-5 h-5 accent-blue-500"
                    />
                  </div>
                  <label htmlFor="noWorkDone" className="text-md font-medium text-gray-700">
                    No Work Done Today
                  </label>
                </div>
              </div>

              {/* Finance Fields */}
              <div className={`space-y-6 ${formData.noWorkDone ? "opacity-50 pointer-events-none" : ""}`}>
                {/* Invoice and Receipt Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Receipt size={18} />
                      </span>
                      <input
                        type="text"
                        id="invoiceNumber"
                        name="invoiceNumber"
                        placeholder="Enter invoice #"
                        value={formData.invoiceNumber}
                        onChange={handleChange}
                        className={`pl-10 p-3 border ${errors.invoiceNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all`}
                      />
                    </div>
                    {errors.invoiceNumber && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertTriangle size={14} className="mr-1" />
                        {errors.invoiceNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="receiptNumber" className="text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FileText size={18} />
                      </span>
                      <input
                        type="text"
                        id="receiptNumber"
                        name="receiptNumber"
                        placeholder="Enter receipt #"
                        value={formData.receiptNumber}
                        onChange={handleChange}
                        className={`pl-10 p-3 border ${errors.receiptNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all`}
                      />
                    </div>
                    {errors.receiptNumber && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertTriangle size={14} className="mr-1" />
                        {errors.receiptNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label htmlFor="invoiceAmount" className="text-sm font-medium text-gray-700 mb-1">Invoice Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Wallet size={18} />
                      </span>
                      <input
                        type="number"
                        id="invoiceAmount"
                        name="invoiceAmount"
                        placeholder="Enter invoice amount"
                        value={formData.invoiceAmount}
                        onChange={handleChange}
                        className={`pl-10 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="amountReceived" className="text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Wallet size={18} />
                      </span>
                      <input
                        type="number"
                        id="amountReceived"
                        name="amountReceived"
                        placeholder="Enter amount received"
                        value={formData.amountReceived}
                        onChange={handleChange}
                        className={`pl-10 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all`}
                      />
                    </div>
                  </div>
                </div>

                {/* Time and Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label htmlFor="closingTime" className="text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Clock size={18} />
                      </span>
                      <input
                        type="time"
                        id="closingTime"
                        name="closingTime"
                        value={formData.closingTime}
                        onChange={handleChange}
                        className={`pl-10 p-3 border ${errors.closingTime ? 'border-red-300' : 'border-gray-300'} rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all`}
                      />
                    </div>
                    {errors.closingTime && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertTriangle size={14} className="mr-1" />
                        {errors.closingTime}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Wallet size={18} />
                      </span>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="pl-10 p-3 border border-gray-300 rounded-lg w-full appearance-none bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Credit">Credit</option>
                        <option value="Debit">Debit Card</option>
                        <option value="Transfer">Bank Transfer</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redemption Section */}
                <div className="border-t border-b border-gray-100 py-6 space-y-6">
                  <h3 className="font-medium text-gray-700 mb-2">Redemption Details</h3>

                  <div className="flex flex-col">
                    <label htmlFor="loyaltyRedemption" className="text-sm font-medium text-gray-700 mb-1">Loyalty Card Redemption</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Award size={18} />
                      </span>
                      <input
                        type="text"
                        id="loyaltyRedemption"
                        name="loyaltyRedemption"
                        placeholder="Enter loyalty redemption details"
                        value={formData.loyaltyRedemption}
                        onChange={handleChange}
                        className="pl-10 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="otherRedemption" className="text-sm font-medium text-gray-700 mb-1">Other Redemption</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Gift size={18} />
                      </span>
                      <input
                        type="text"
                        id="otherRedemption"
                        name="otherRedemption"
                        placeholder="Enter other redemption details"
                        value={formData.otherRedemption}
                        onChange={handleChange}
                        className="pl-10 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="redemptionDetails" className="text-sm font-medium text-gray-700 mb-1">Redemption Details</label>
                    <textarea
                      id="redemptionDetails"
                      name="redemptionDetails"
                      placeholder="Enter detailed information about redemptions"
                      value={formData.redemptionDetails}
                      onChange={handleChange}
                      className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all h-24 resize-none"
                    ></textarea>
                  </div>

                  {/* Remaining Amount Section */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Remaining Amount</label>
                    <input
                      type="text"
                      value={calculatedRemainingAmount}
                      readOnly
                      className="p-3 border border-gray-300 text-red-500 font-bold rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                    />
                  </div>
                </div>



              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="button"
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200"
                  onClick={() => setFormData(initialState)}
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.noWorkDone}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg text-white ${isSubmitting || formData.noWorkDone ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <Check size={18} className="mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Form'}
                </button>

              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-5">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <List className="w-6 h-6 mr-2" />
                Finance Records
              </h2>
              <p className="text-blue-100 text-sm mt-1">Browse all financial records</p>
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
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                  />
                </div>

                {/* Month-Year Filter */}
                <div className="flex flex-wrap gap-2">
                  <div className="relative inline-block w-40">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {months.map((month, index) => (
                        <option key={month} value={month}>
                          {monthNames[index]}
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
                  <button
                    onClick={fetchFinanceRecords}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="p-4">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[800px] divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty Redemption</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Redemption</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redemption Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Work Done</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-10 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600 font-medium">No finance records found</p>
                            <p className="text-gray-400 mt-1">Try adjusting your search</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.invoiceNumber || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.receiptNumber || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.closingTime || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.paymentMethod || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{(() => {
                            const v = record.invoiceAmount;
                            const fallback = deriveInvoiceFromRecord(record);
                            const value = (v === null || v === undefined || v === "") ? fallback : v;
                            return (value === null || value === undefined || value === "") ? "N/A" : value;
                          })()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.loyaltyRedemption || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.otherRedemption || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.redemptionDetails || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{record.noWorkDone ? "Yes" : "No"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{(() => {
                            const toNum = (value) => {
                              if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
                              if (typeof value === 'string') {
                                const parsed = parseFloat(value.replace(/,/g, '').trim());
                                return Number.isFinite(parsed) ? parsed : 0;
                              }
                              return 0;
                            };
                            const fallback = toNum(record?.invoiceAmount) - (toNum(record?.amountReceived) + toNum(record?.loyaltyRedemptionAmount ?? record?.loyaltyRedemption) + toNum(record?.otherRedemptionAmount ?? record?.otherRedemption));
                            const value = typeof record.remainingAmount === 'number' ? record.remainingAmount : fallback;
                            return Number.isFinite(value) ? value : 'N/A';
                          })()}</td>
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

export default FinanceForm;
