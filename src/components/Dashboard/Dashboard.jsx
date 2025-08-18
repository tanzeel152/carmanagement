"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { db } from "../../utilis/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { Car, ClipboardList, AlertTriangle, RefreshCw, Search } from "lucide-react";



const AdminDashboard = () => {
  const { user, role, loading } = useAuth();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCars, setFilteredCars] = useState([]);



  useEffect(() => {
    if (user && role === "admin") {
      fetchPendingExitCars();
    }
  }, [user, role]);

  useEffect(() => {
    // Filter cars based on search term
    const results = cars.filter(car =>
      (car.registrationNo && car.registrationNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.carMake && car.carMake.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.variant && car.variant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.unregisteredSerialNo && car.unregisteredSerialNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.entryDate && car.entryDate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (car.srNo && car.srNo.toLowerCase().includes(searchTerm.toLowerCase()))

    );
    setFilteredCars(results);
  }, [searchTerm, cars]);

  const fetchPendingExitCars = async () => {
    try {
      setIsLoading(true);
      const year = new Date().getFullYear().toString();
      const month = new Date().toLocaleString("default", { month: "short" });

      // Fetch cars from EntryGuard
      const entrySnapshot = await getDocs(collection(db, `EntryGuard/${year}/${month}`));
      const entryCars = [];
      entrySnapshot.docs.forEach((doc) => {
        entryCars.push({ id: doc.id, ...doc.data() });
      });

      // Fetch cars from ExitGuard
      const exitSnapshot = await getDocs(collection(db, `ExitGuard/${year}/${month}`));
      const exitCarNumbers = new Set();
      const exitUnregisteredSerials = new Set();

      exitSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data?.registrationNo?.trim()) {
          exitCarNumbers.add(data.registrationNo.trim());
        }
        if (data?.unregisteredSerialNo?.trim()) {
          exitUnregisteredSerials.add(data.unregisteredSerialNo.trim());
        }
      });

      // Filter cars: Exclude both registered and unregistered vehicles that exist in ExitGuard
      const pendingExitCars = [];
      entryCars.forEach((car) => {
        const isRegisteredCar =
          car.registrationNo?.trim() &&
          !exitCarNumbers.has(car.registrationNo.trim());

        const isUnregisteredCar =
          car.isUnregistered &&
          car.unregisteredSerialNo?.trim() &&
          !exitUnregisteredSerials.has(car.unregisteredSerialNo.trim());

        console.log("isRegisteredCar:", isRegisteredCar);
        console.log("isUnregisteredCar:", isUnregisteredCar);

        if (isRegisteredCar || isUnregisteredCar) {
          pendingExitCars.push(car);
        }
      });

      setCars(pendingExitCars);
      setFilteredCars(pendingExitCars);
    } catch (error) {
      console.error("Error fetching pending exit cars:", error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!user || role !== "admin") return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to view this dashboard.</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6 md:p-10 mb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Welcome, <span className="text-blue-600">{user?.displayName || 'Admin'}</span>
          </h1>
          <button
            onClick={fetchPendingExitCars}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500">
            <div className="p-6 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Car className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cars in Workshop</p>
                <p className="text-3xl font-bold text-gray-800">{cars.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-green-500">
            <div className="p-6 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <ClipboardList className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Month</p>
                <p className="text-3xl font-bold text-gray-800">{new Date().toLocaleString("default", { month: "long" })}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-purple-500 md:col-span-2 lg:col-span-1">
            <div className="p-6 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Car className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Average Stay Duration</p>
                <p className="text-3xl font-bold text-gray-800">
                  {cars.length ? '3.5 days' : '0 days'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Car Table with Search */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Cars in Workshop (Pending Exit)</h2>
                <p className="text-gray-500 mt-1">Showing all vehicles currently in service</p>
              </div>

              {/* Search Input */}
              <div className="relative mt-4 md:mt-0 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by reg no, make or variant..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      onClick={() => setSearchTerm("")}
                      className="pr-3 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results Count */}
            {searchTerm && (
              <p className="mt-2 text-sm text-gray-500">
                Found {filteredCars.length} {filteredCars.length === 1 ? 'result' : 'results'} for "{searchTerm}"
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Car className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                {searchTerm ? 'No matches found for your search' : 'No cars pending exit at this time.'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Try a different search term' : 'All vehicles have been serviced and released.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Make</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCars.map((car, index) => {
                    // Calculate days in workshop (sample logic)
                    const entryDate = car.entryDate ? new Date(car.entryDate) : new Date();
                    const today = new Date();
                    const daysInWorkshop = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));

                    // Status based on days
                    let status = "In Progress";
                    let statusColor = "bg-yellow-100 text-yellow-800";

                    if (daysInWorkshop > 5) {
                      status = "Delayed";
                      statusColor = "bg-red-100 text-red-800";
                    } else if (daysInWorkshop < 2) {
                      status = "New";
                      statusColor = "bg-green-100 text-green-800";
                    }

                    return (
                      <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{car.srNo || index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{car.carMake || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{car.variant || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{car.registrationNo || car.unregisteredSerialNo || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{car.entryDate || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;