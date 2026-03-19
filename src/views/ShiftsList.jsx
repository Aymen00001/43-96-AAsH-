import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import UserService from "../Service/UserService";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function ShiftsList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const storeId = Cookies.get("idCRM");
  const storeName = Cookies.get("Name");

  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftTickets, setShiftTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');

  // Date picker state
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  // Format date for API
  const formatDateForAPI = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  // Format date for display
  const formatDateDisplay = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch all tickets and group by shift
  const fetchShifts = async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const params = {
        idCRM: storeId,
        date1: formatDateForAPI(startDate),
        date2: formatDateForAPI(endDate),
        limit: 500, // Large limit to get all tickets
      };
      if (searchTerm) params.search = searchTerm;
      if (paymentFilter) params.paymentMethod = paymentFilter;
      if (fulfillmentFilter) params.fulfillmentMode = fulfillmentFilter;

      const response = await UserService.GetTickets(params);
      const allTickets = response.data || [];

      // Group tickets by shift (closureNumber)
      const shiftsMap = {};
      allTickets.forEach((ticket) => {
        const shiftNum = ticket.closureNumber || 'Unknown';
        if (!shiftsMap[shiftNum]) {
          shiftsMap[shiftNum] = {
            closureNumber: shiftNum,
            tickets: [],
            totalAmount: 0,
            ticketCount: 0,
          };
        }
        shiftsMap[shiftNum].tickets.push(ticket);
        shiftsMap[shiftNum].totalAmount += ticket.TTC || 0;
        shiftsMap[shiftNum].ticketCount += 1;
      });

      // Convert to array and sort by shift number
      const shiftsArray = Object.values(shiftsMap).sort((a, b) => {
        const aNum = parseInt(a.closureNumber) || 0;
        const bNum = parseInt(b.closureNumber) || 0;
        return aNum - bNum;
      });

      setShifts(shiftsArray);
      setSelectedShift(null);
      setShiftTickets([]);
    } catch (err) {
      console.error("Error fetching shifts:", err);
      setError(err?.toString() || "Error fetching shifts");
    } finally {
      setLoading(false);
    }
  };

  // Load shifts on mount and when filters change
  useEffect(() => {
    fetchShifts();
  }, [storeId, startDate, endDate, searchTerm, paymentFilter, fulfillmentFilter]);

  // Handle shift selection
  const handleSelectShift = (shift) => {
    setSelectedShift(shift);
    setShiftTickets(shift.tickets);
  };

  // Handle back from shift details
  const handleBackToShifts = () => {
    setSelectedShift(null);
    setShiftTickets([]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!selectedShift) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {t('dashboard.shifts') || 'Shifts Management'}
          </h1>
          <p className="text-slate-600">
            {storeName} • {formatDateDisplay(startDate)} to {formatDateDisplay(endDate)}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tickets..."
                className="border p-2 rounded w-full sm:w-auto"
              />
              <input
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="border p-2 rounded"
              />
              <span className="text-slate-600">to</span>
              <input
                type="date"
                value={endDate.toISOString().split('T')[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="border p-2 rounded"
              />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Payment Methods</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
                <option value="TICKET_RESTO">Meal Voucher</option>
              </select>
              <select
                value={fulfillmentFilter}
                onChange={(e) => setFulfillmentFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Fulfillment Types</option>
                <option value="Dine-in">Dine-in</option>
                <option value="Takeaway">Takeaway</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"
              />
              <p className="text-slate-600">Loading shifts...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Shifts Grid */}
        {!loading && shifts.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
          >
            {shifts.map((shift) => (
              <motion.div
                key={shift.closureNumber}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => handleSelectShift(shift)}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-2xl font-bold text-blue-600">
                          Shift {shift.closureNumber}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 p-3 rounded">
                          <p className="text-slate-600">Tickets</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {shift.ticketCount}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded">
                          <p className="text-slate-600">Total Sales</p>
                          <p className="text-2xl font-bold text-slate-900">
                            €{shift.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-slate-500">
                          Click to view details →
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Shifts State */}
        {!loading && shifts.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-slate-600 py-8">
                No shifts found for the selected date range and filters.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }

  // Shift Details View
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBackToShifts}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Shifts
        </button>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Shift {selectedShift.closureNumber} Details
        </h1>
        <p className="text-slate-600">
          {selectedShift.ticketCount} tickets • €{selectedShift.totalAmount.toFixed(2)} total sales
        </p>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Ticket #</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Payment</th>
                  <th className="px-3 py-2 text-left">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {shiftTickets.map((ticket) => (
                  <tr key={ticket._id} className="even:bg-slate-50 hover:bg-slate-100">
                    <td className="px-3 py-2 font-medium">{ticket.idTiquer}</td>
                    <td className="px-3 py-2">
                      {ticket.Date ? formatDateDisplay(
                        new Date(ticket.Date.slice(0, 4), parseInt(ticket.Date.slice(4, 6)) - 1, ticket.Date.slice(6, 8))
                      ) : '-'}
                    </td>
                    <td className="px-3 py-2">{ticket.HeureTicket || '-'}</td>
                    <td className="px-3 py-2">
                      {ticket.Signature || ticket.customerName || '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      €{(ticket.TTC || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      {ticket.PaymentMethods
                        ? ticket.PaymentMethods.map(p => p.payment_method || p.ModePaimeent).join(', ')
                        : (ticket.ModePaiement && Array.isArray(ticket.ModePaiement) ? ticket.ModePaiement.map(p => p.ModePaimeent).join(', ') : ticket.ModePaiement || '')}
                    </td>
                    <td className="px-3 py-2">
                      {ticket.ModeConsomation || ticket.ConsumptionMode || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shiftTickets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600">No tickets found in this shift.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ShiftsList;
