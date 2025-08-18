import React, { useState } from 'react';
import {
  Table,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Calendar,
  User,
  Wrench,
  Car,
  Clipboard,
  DollarSign
} from 'lucide-react';

const ServiceRecordsTable = ({ fetchedData, onEdit }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("mechanicalJob.jobCardNumber");
  const [sortDirection, setSortDirection] = useState("asc");
  const itemsPerPage = 10;


// Get job type from the data object
  const getJobType = (item) => {
    if (item.mechanicalJob && item.mechanicalJob.jobCardNumber) return 'Mechanical';
    if (item.dentingJob && item.dentingJob.jobCardNumber) return 'Denting';
    if (item.paintJob) return 'Paint';
    if (item.groundingJob) return 'Grounding';
    if (item.finalPolishing) return 'Polishing';
    if (item.finalFitting) return 'Fitting';
    return 'Unknown';
  };

  // Get customer name from the data object
  const getCustomerName = (item) => {
    if (item.mechanicalJob && item.mechanicalJob.customerName) return item.mechanicalJob.customerName;
    if (item.dentingJob && item.dentingJob.customerName) return item.dentingJob.customerName;
    return 'N/A';
  };

  // Get job card number from the data object
  const getJobCardNumber = (item) => {
    if (item.mechanicalJob && item.mechanicalJob.jobCardNumber) return item.mechanicalJob.jobCardNumber;
    if (item.dentingJob && item.dentingJob.jobCardNumber) return item.dentingJob.jobCardNumber;
    return 'N/A';
  };

  // Get service type from the data object
  const getServiceType = (item) => {
    if (item.mechanicalJob && item.mechanicalJob.serviceType) return item.mechanicalJob.serviceType;
    if (item.dentingJob) return 'Panel Work';
    if (item.paintJob) return item.paintJob.typeOfPaint || 'Paint Job';
    if (item.groundingJob) return 'Grounding';
    if (item.finalPolishing) return 'Polishing';
    if (item.finalFitting) return 'Fitting';
    return 'N/A';
  };

  // Get date for sorting and display
  const getServiceDate = (item) => {
    if (item.mechanicalJob && item.mechanicalJob.bayInTime) return item.mechanicalJob.bayInTime;
    if (item.dentingJob && item.dentingJob.bayInTime) return item.dentingJob.bayInTime;
    if (item.paintJob && item.paintJob.bayInTime) return item.paintJob.bayInTime;
    if (item.groundingJob && item.groundingJob.bayInTime) return item.groundingJob.bayInTime;
    if (item.finalPolishing && item.finalPolishing.bayInTime) return item.finalPolishing.bayInTime;
    if (item.finalFitting && item.finalFitting.bayInTime) return item.finalFitting.bayInTime;
    return 'N/A';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  // Filter data based on search term
  const filteredData = fetchedData.filter(item => {
    const customerName = getCustomerName(item).toLowerCase();
    const jobCardNumber = getJobCardNumber(item).toLowerCase();
    const jobType = getJobType(item).toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return customerName.includes(searchLower) ||
      jobCardNumber.includes(searchLower) ||
      jobType.includes(searchLower);
  });

  // Sort data based on selected field and direction
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue, bValue;

    if (sortField === 'customerName') {
      aValue = getCustomerName(a);
      bValue = getCustomerName(b);
    } else if (sortField === 'jobCardNumber') {
      aValue = getJobCardNumber(a);
      bValue = getJobCardNumber(b);
    } else if (sortField === 'jobType') {
      aValue = getJobType(a);
      bValue = getJobType(b);
    } else if (sortField === 'serviceDate') {
      aValue = getServiceDate(a);
      bValue = getServiceDate(b);
    } else if (sortField === 'serviceType') {
      aValue = getServiceType(a);
      bValue = getServiceType(b);
    } else {
      aValue = a.id;
      bValue = b.id;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get icon for job type
  const getJobIcon = (jobType) => {
    switch (jobType.toLowerCase()) {
      case 'mechanical':
        return <Wrench className="w-5 h-5 text-blue-600" />;
      case 'denting':
        return <Clipboard className="w-5 h-5 text-purple-600" />;
      case 'paint':
        return <Eye className="w-5 h-5 text-green-600" />;
      case 'grounding':
        return <Clipboard className="w-5 h-5 text-orange-600" />;
      case 'polishing':
        return <Eye className="w-5 h-5 text-yellow-600" />;
      case 'fitting':
        return <Wrench className="w-5 h-5 text-teal-600" />;
      default:
        return <Car className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Search and filter section */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Car className="w-5 h-5 mr-2" />
          Service Records
        </h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Table section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('jobType')}
              >
                <div className="flex items-center gap-1">
                  <Table className="w-4 h-4" />
                  <span>Job Type</span>
                  {sortField === 'jobType' && (
                    <ChevronRight className={`w-4 h-4 transform ${sortDirection === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('jobCardNumber')}
              >
                <div className="flex items-center gap-1">
                  <Clipboard className="w-4 h-4" />
                  <span>Card #</span>
                  {sortField === 'jobCardNumber' && (
                    <ChevronRight className={`w-4 h-4 transform ${sortDirection === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                  {sortField === 'customerName' && (
                    <ChevronRight className={`w-4 h-4 transform ${sortDirection === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('serviceType')}
              >
                <div className="flex items-center gap-1">
                  <Wrench className="w-4 h-4" />
                  <span>Service</span>
                  {sortField === 'serviceType' && (
                    <ChevronRight className={`w-4 h-4 transform ${sortDirection === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('serviceDate')}
              >
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                  {sortField === 'serviceDate' && (
                    <ChevronRight className={`w-4 h-4 transform ${sortDirection === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const jobType = getJobType(item);
                return (




                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getJobIcon(jobType)}
                        <span className="text-sm font-medium text-gray-900">{jobType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getJobCardNumber(item)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getCustomerName(item)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getServiceType(item)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(getServiceDate(item))}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        onClick={() => onEdit && onEdit(item)}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>


                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No records found
                </td>
              </tr>

            )}
          </tbody>
        </table>
      </div>


      {/* Pagination section */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, sortedData.length)}</span> of{' '}
              <span className="font-medium">{sortedData.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${page === i + 1 ? 'bg-blue-50 border-blue-500 text-blue-600 z-10' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
        <div className="flex sm:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`p-2 border border-gray-300 rounded-md ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`p-2 border border-gray-300 rounded-md ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRecordsTable;

