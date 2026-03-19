import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import UserService from "../Service/UserService";
import { Button } from "../components/ui/Button";
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowLeft, CreditCard, Banknote, Utensils, Truck, UtensilsCrossed, FileDown, Wallet, Package, Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportDocument } from "../components/generatePDFNew.jsx";
import generateExcel from "../components/generateExcel";

let renderCount = 0;

// Feature: Shift Number from Z Field
// Displays shift numbers from database Z field with fallback to closureNumber
// Logging enabled for: shift filtering, field priority, and table display

function Dashboard() {
  renderCount++;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const storeId = Cookies.get("idCRM");
  const storeName = Cookies.get("Name");




  // Helper to avoid showing raw translation keys if a translation is missing
  const translateOrFallback = (key, fallback) => {
    const translated = t(key);
    return translated && translated !== key ? translated : fallback;
  };

  // Payment method configuration (English keys, translated only on display)
  // All payment methods use English keys for validation and API communication
  const paymentMethodLabels = {
    "CARD": { label: translateOrFallback('paymentMethods.card', 'Card'), icon: CreditCard, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", barColor: "bg-blue-600" },
    "CASH": { label: translateOrFallback('paymentMethods.cash', 'Cash'), icon: Banknote, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", barColor: "bg-green-600" },
    "MEAL_VOUCHER": { label: translateOrFallback('paymentMethods.mealVoucher', 'Meal Voucher'), icon: UtensilsCrossed, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", barColor: "bg-orange-600" },
    "CHECK": { label: translateOrFallback('paymentMethods.check', 'Check'), icon: Wallet, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200", barColor: "bg-amber-600" },
    "FIDELITY_POINTS": { label: translateOrFallback('paymentMethods.fidelityPoints', 'Fidelity Points'), icon: Wallet, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200", barColor: "bg-rose-600" },
    "STORE_CREDIT": { label: translateOrFallback('paymentMethods.storeCredit', 'Store Credit'), icon: Wallet, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200", barColor: "bg-purple-600" },
    "CORPORATE_ACCOUNT": { label: translateOrFallback('paymentMethods.corporateAccount', 'Corporate Account'), icon: Wallet, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", barColor: "bg-indigo-600" }
  };

  // Fulfillment method translations and icons
  const fulfillmentMethodLabels = {
    "Dine-in": { label: translateOrFallback('fulfillmentMethods.dineIn', 'Dine In'), icon: Users, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", barColor: "bg-indigo-600" },
    "Takeaway": { label: translateOrFallback('fulfillmentMethods.takeaway', 'Takeaway'), icon: ShoppingBag, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200", barColor: "bg-purple-600" },
    "Delivery": { label: translateOrFallback('fulfillmentMethods.delivery', 'Delivery'), icon: Truck, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", barColor: "bg-red-600" }
  };
  
  const [stats, setStats] = useState({
    totalStores: 24,
    totalSales: "$0.00",
    totalUsers: 0,
    activeOrders: 0,
    taxes: "$0.00",
    taxExclusive: "$0.00",
    totalOrders: 0,
    paymentMethods: {},
    fulfillmentMethods: {},
  });
  const [dailySalesData, setDailySalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [bottomProducts, setBottomProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null); // Store full API response for exports

  // Orders table state
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit, setOrdersLimit] = useState(25);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // Filters/search
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [availableShifts, setAvailableShifts] = useState([]);

  // Modal state for ticket display
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketContent, setTicketContent] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Date picker state (dashboard metrics)
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  // Date filter for the orders table (single date)
  const [orderDate, setOrderDate] = useState(today);

  // Simple date change handlers (no auto-trigger)
  const handleStartDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setTempStartDate(newDate);
  };

  const handleEndDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setTempEndDate(newDate);
  };

  // Add ref to track if initialLoad
  const initialLoad = useRef(true);

  // Normalize payment methods from API (French to English keys)
  const normalizePaymentMethod = (methodValue) => {
    if (!methodValue) return methodValue;

    const normalized = String(methodValue)
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-\s]+/g, '_')
      .toUpperCase();

    // Mapping from API values (French/mixed) to English keys
    const paymentMethodMap = {
      'CARTE_BANCAIRE': 'CARD',
      'CARD': 'CARD',
      'ESPECE': 'CASH',
      'ESPECES': 'CASH',
      'CASH': 'CASH',
      'TICKET_RESTO': 'MEAL_VOUCHER',
      'MEAL_VOUCHER': 'MEAL_VOUCHER',
      'CHÈQUE': 'CHECK',
      'CHEQUE': 'CHECK',
      'CHECK': 'CHECK',
      'POINTS_FIDÉLITÉ': 'FIDELITY_POINTS',
      'POINTS_FIDELITE': 'FIDELITY_POINTS',
      'FIDELITY_POINTS': 'FIDELITY_POINTS',
      'AVOIR': 'STORE_CREDIT',
      'STORE_CREDIT': 'STORE_CREDIT',
      'CLIENT_EN_COMPTE': 'CORPORATE_ACCOUNT',
      'CORPORATE_ACCOUNT': 'CORPORATE_ACCOUNT'
    };

    return paymentMethodMap[normalized] || normalized;
  };

  // Normalize fulfillment methods from API (French/mixed) to English keys used in the UI
  const normalizeFulfillmentMethod = (methodValue) => {
    if (!methodValue) return methodValue;

    const normalized = String(methodValue)
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase();

    const fulfillmentMap = {
      'sur place': 'Dine-in',
      'surplace': 'Dine-in',
      'dine in': 'Dine-in',
      'dine-in': 'Dine-in',
      'dinein': 'Dine-in',
      'a emporter': 'Takeaway',
      'aemporter': 'Takeaway',
      'a_emporter': 'Takeaway',
      'takeaway': 'Takeaway',
      'livraison': 'Delivery',
      'delivery': 'Delivery'
    };

    return fulfillmentMap[normalized] || methodValue;
  };

  // Z helpers (displayed as YYYYMMDD-<shift> while still filtering by numeric shift)
  const getRawZ = (order) => {
    if (!order) return null;
    const z = order.Z !== undefined && order.Z !== null ? order.Z : order.closureNumber;
    return z !== undefined && z !== null ? String(z) : null;
  };

  const formatZ = (rawZ, date) => {
    if (!rawZ) return null;
    const str = String(rawZ).trim();

    // If already formatted as YYYYMMDD-<shift>, keep it.
    if (/^[0-9]{8}-\d+$/.test(str)) return str;

    // If we have a date in YYYYMMDD and a numeric shift, format it.
    if (typeof date === 'string' && /^[0-9]{8}$/.test(date) && /^[0-9]+$/.test(str)) {
      const paddedShift = String(Number(str)).padStart(2, '0');
      return `${date}-${paddedShift}`;
    }

    return str;
  };

  const getShiftKey = (order) => {
    const raw = getRawZ(order);
    const date = order.Date || order.date;
    return formatZ(raw, date);
  };

  const parseShiftKey = (shiftKey) => {
    if (!shiftKey) return { date: null, shift: null, raw: '' };
    const str = String(shiftKey);
    const match = /^([0-9]{4})([0-9]{2})([0-9]{2})-(\d+)$/.exec(str);
    if (match) {
      const [, year, month, day, shift] = match;
      return {
        date: new Date(Number(year), Number(month) - 1, Number(day)),
        shift: Number(shift),
        raw: str,
      };
    }
    const num = parseInt(str, 10);
    return {
      date: null,
      shift: isNaN(num) ? null : num,
      raw: str,
    };
  };

  const sortShiftKeys = (a, b) => {
    const A = parseShiftKey(a);
    const B = parseShiftKey(b);

    if (A.date && B.date) {
      const diff = A.date - B.date;
      if (diff !== 0) return diff;
      if (A.shift !== null && B.shift !== null) return A.shift - B.shift;
      return A.raw.localeCompare(B.raw);
    }

    if (A.date && !B.date) return 1;
    if (!A.date && B.date) return -1;

    if (A.shift !== null && B.shift !== null) return A.shift - B.shift;
    return A.raw.localeCompare(B.raw);
  };

  // Apply dates manually when button is clicked
  const handleApplyDates = (e) => {
    e?.preventDefault();
    console.log(`📊 [DATE_APPLY] User clicked Apply - Start: ${tempStartDate.toDateString()}, End: ${tempEndDate.toDateString()}`);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowDatePicker(false);
  };

  // animation variants used by framer-motion; container used widely so must be defined early
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // ---------------------------------------------------------------------------
  // Orders fetch helper
  const fetchOrders = async () => {
    if (!storeId) return;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const dateString = formatDateForAPI(orderDate);
      const params = {
        idCRM: storeId,
        date1: dateString,
        date2: dateString,
        page: ordersPage,
        limit: ordersLimit,
      };
      if (searchTerm) params.search = searchTerm;
      // Ensure payment method sent to API is in English
      if (paymentFilter) params.paymentMethod = normalizePaymentMethod(paymentFilter);
      if (fulfillmentFilter) params.fulfillmentMode = fulfillmentFilter;
      // Filter by Z field (the actual shift number field)
      if (shiftFilter) params.Z = shiftFilter;

      if (shiftFilter) {
        console.log(`[Z_FILTER] 🎯 Requesting orders for Z ${shiftFilter} | Params: Z=${params.Z}`);
      } else {
        console.log(`[Z_FILTER] No filter - requesting all Z values`);
      }

      if (paymentFilter) {
        console.log(`[PAYMENT_FILTER] 🎯 Requesting orders for payment method: ${normalizePaymentMethod(paymentFilter)} (validated: ${params.paymentMethod})`);
      }
      
      if (fulfillmentFilter) {
        console.log(`[FULFILLMENT_FILTER] 🎯 Requesting orders for fulfillment mode: ${fulfillmentFilter}`);
      }

      const response = await UserService.GetTickets(params);
      let receivedOrders = response.data || [];
      
      // Normalize payment methods in received orders
      receivedOrders = receivedOrders.map(order => ({
        ...order,
        ModePaiement: normalizePaymentMethod(order.ModePaiement),
        PaymentMethods: Array.isArray(order.PaymentMethods) 
          ? order.PaymentMethods.map(p => ({
              ...p,
              payment_method: normalizePaymentMethod(p.payment_method || p.ModePaiement)
            }))
          : order.PaymentMethods
      }));
      
      // Fallback: If backend doesn't support Z filter, apply filter on frontend
      if (shiftFilter && receivedOrders.length > 0) {
        const shiftsInResponse = receivedOrders
          .map(order => getRawZ(order))
          .filter((value, index, self) => value !== undefined && value !== null && self.indexOf(value) === index);

        // If we got all Z values instead of filtered, apply filter on frontend
        if (shiftsInResponse.length > 1) {
          console.log(`⚠️  [Z_FILTER] Backend didn't filter - applying frontend filter for Z ${shiftFilter}`);
          receivedOrders = receivedOrders.filter(order => {
            const shift = getRawZ(order);
            return String(shift) === String(shiftFilter);
          });
        }
      }
      
      setOrders(receivedOrders);
      setOrdersTotal(response.totalCount || receivedOrders.length);
      
      // Validate what we're actually displaying
      if (receivedOrders && receivedOrders.length > 0) {
        const shiftsInDisplay = receivedOrders
          .map(order => order.Z !== undefined ? order.Z : order.closureNumber)
          .filter((value, index, self) => value !== undefined && value !== null && self.indexOf(value) === index)
          .sort((a, b) => {
            const aNum = parseInt(a);
            const bNum = parseInt(b);
            return isNaN(aNum) || isNaN(bNum) ? 0 : aNum - bNum;
          });
        
        if (shiftFilter) {
          console.log(`✅ [Z_FILTER] Displaying ${receivedOrders.length} orders from Z ${shiftFilter}`);
        } else {
          console.log(`[Z_FILTER] Displaying ${receivedOrders.length} total orders from all Z values: [${shiftsInDisplay.join(', ')}]`);
        }
      }
    } catch (err) {
      setOrdersError(err?.toString() || "Error fetching orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // reload orders when any relevant parameter changes
  useEffect(() => {
    fetchOrders();
  }, [orderDate, searchTerm, paymentFilter, fulfillmentFilter, shiftFilter, ordersPage, ordersLimit]);

  // Function to fetch and display ticket receipt
  const handleViewTicket = async (order) => {
    setSelectedTicket(order);
    setTicketLoading(true);
    setShowTicketModal(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "https://api-statistics.makseb.fr";
      const baseUrl = apiBase.replace(/\/$/, "");
      
      // Extract numeric ticket ID (remove "DAY-" or similar prefixes)
      const ticketId = order.idTiquer.replace(/[^0-9]/g, '') || order.idTiquer;
      
      const date = order.Date || formatDateForAPI(new Date());
      const idCRM = storeId; // Use the store ID from cookies
      const url = `${baseUrl}/display-ticket-receipt/${idCRM}/${date}/${ticketId}`;
      
      console.log(`[VIEW_TICKET] Fetching receipt for ticket ${order.idTiquer} - Shift: ${order.Z || order.closureNumber}`);
      
      const response = await axios.get(url);
      setTicketContent(response.data);
    } catch (err) {
      setTicketContent(`<div style="padding: 20px; color: red;">Error loading ticket: ${err.message}</div>`);
    } finally {
      setTicketLoading(false);
    }
  };

  // Format date for API usage (YYYYMMDD)
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






  useEffect(() => {
    // Update temp dates to match actual dates
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    
    async function fetchStoreMetrics() {
      if (!storeId) {
        return;
      }
      
      // Only show loading on initial load, not on date changes
      if (initialLoad.current) {
        setLoading(true);
        initialLoad.current = false;
      }
      
      setError(null);

      const apiBase = import.meta.env.VITE_API_URL || "https://api-statistics.makseb.fr";
      const baseUrl = apiBase.replace(/\/$/, "");

      const date1 = formatDateForAPI(startDate);
      const date2 = formatDateForAPI(endDate);

      try {
        // Fetch sales summary (includes revenue and payment methods breakdown)
        const salesUrl = `${baseUrl}/get-sales-summary?idCRM=${encodeURIComponent(storeId)}&date1=${date1}&date2=${date2}`;
        
        const salesRes = await axios.get(salesUrl);
        
        const salesData = salesRes.data?.data;

        if (!salesData) {
          throw new Error("No data field in response");
        }

        const chiffreAffaire = salesData.ChiffreAffaire;
        const productData = {};

        // Check for product details in the response
        if (salesData.ProduitDetailler && typeof salesData.ProduitDetailler === 'object') {
          Object.entries(salesData.ProduitDetailler).forEach(([productName, details]) => {
            if (details && typeof details === 'object') {
              // Extract amount - try multiple field names
              let amount = 0;
              const fieldNames = ['Somme', 'Total_TTC', 'TotalTTC', 'total', 'amount', 'Montant', 'MontantTTC', 'montantTTC'];
              for (const field of fieldNames) {
                if (details[field] !== undefined) {
                  amount = parseFloat(details[field]) || 0;
                  break;
                }
              }
              
              const quantity = details.Quantite || details.Qty || details.Count || 0;
              
              productData[productName] = {
                name: productName,
                amount: parseFloat(amount) || 0,
                quantity: parseInt(quantity) || 0
              };
            }
          });
        }

        // Calculate total product sales and sort
        const totalProductSales = Object.values(productData).reduce((sum, p) => sum + (p.amount || 0), 0);

        const sortedProducts = Object.values(productData)
          .map(p => ({
            ...p,
            percentage: totalProductSales > 0 ? ((p.amount / totalProductSales) * 100).toFixed(1) : 0
          }))
          .sort((a, b) => b.amount - a.amount);

        // Get top 5 and bottom 5
        const top5 = sortedProducts.slice(0, 5);
        const bottom5 = sortedProducts.slice(-5).reverse();

        setTopProducts(top5);
        setBottomProducts(bottom5);

        // Build payment methods breakdown from modePaiement
        const paymentMethods = {};
        let totalPaymentAmount = 0;
        
        if (salesData.modePaiement) {
          Object.entries(salesData.modePaiement).forEach(([method, amount]) => {
            const cleanAmount = parseFloat(amount) || 0;
            paymentMethods[method] = {
              amount: cleanAmount,
              count: 0,
              average: 0,
            };
            totalPaymentAmount += cleanAmount;
          });
        }

        // Build fulfillment methods breakdown from modeConsommation (normalize French/English keys)
        const fulfillmentMethods = {};
        if (salesData.modeConsommation && typeof salesData.modeConsommation === 'object') {
          Object.entries(salesData.modeConsommation).forEach(([method, amount]) => {
            const cleanAmount = parseFloat(amount) || 0;
            const normalized = normalizeFulfillmentMethod(method);
            fulfillmentMethods[normalized] = {
              amount: (fulfillmentMethods[normalized]?.amount || 0) + cleanAmount,
            };
          });
        }

        // Extract total revenue from ChiffreAffaire
        const totalTTC = salesData.ChiffreAffaire?.Total_TTC || 0;
        const totalHT = salesData.ChiffreAffaire?.Total_HT || 0;
        const devise = salesData.devise || "€";
        
        const totalRevenue = `${parseFloat(totalTTC).toFixed(2)}${devise}`;
        
        // Calculate taxes (TTC - HT)
        const taxAmount = parseFloat(totalTTC) - parseFloat(totalHT);
        const totalTaxes = `${parseFloat(taxAmount).toFixed(2)}${devise}`;
        const totalExcludingTax = `${parseFloat(totalHT).toFixed(2)}${devise}`;
        
        // Count total orders from payment methods or etat tiquet
        const etatTiquerEncaiser = salesData.EtatTiquer?.Encaiser || 0;
        
        const totalOrdersCount = Object.values(paymentMethods).reduce((sum, method) => sum + (method.count || 0), 0) || etatTiquerEncaiser;

        const mapped = {
          totalStores: storeId ? 1 : stats.totalStores,
          totalSales: totalRevenue,
          taxes: totalTaxes,
          taxExclusive: totalExcludingTax,
          totalOrders: totalOrdersCount,
          totalUsers: Object.keys(paymentMethods).length || stats.totalUsers,
          activeOrders: salesData.EtatTiquer?.Encaiser || 0,
          paymentMethods: paymentMethods,
          fulfillmentMethods: fulfillmentMethods,
          devise: devise,
        };
        
        setStats((s) => { 
          return { ...s, ...mapped };
        });
        
        setApiData(salesData);
      } catch (err) {
        setError(`Failed to load store metrics: ${err.message}`);
        setDailySalesData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStoreMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, startDate, endDate]);

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <motion.div variants={itemVariants}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-600 text-sm mb-1">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              {trend && (
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                  <TrendingUp size={14} /> {trend}
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icon size={24} className="text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Debug Info - Show when storeId is missing */}
      {!storeId && (
        <motion.div 
          variants={itemVariants}
          className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl"
        >
          <h2 className="text-lg font-semibold text-yellow-900 mb-4">{t('dashboard.configIssue')}</h2>
          <div className="space-y-3 text-yellow-800 text-sm mb-4">
            <p><strong>{t('dashboard.storeIdMissing')}</strong></p>
            <p>{t('dashboard.storeIdMissingDesc')}</p>
            <div className="mt-4 p-3 bg-white rounded border border-yellow-200 font-mono text-xs">
              <p>storeId (idCRM): <span className="text-red-600">NOT SET</span></p>
              <p>storeName (Name): <span className={storeName ? "text-green-600" : "text-red-600"}>{storeName || "NOT SET"}</span></p>
            </div>
          </div>
          <Button 
            variant="primary"
            onClick={() => {
              console.log("[DASHBOARD] User returning to stores list");
              navigate("/admin/stores");
            }}
          >
            {t('dashboard.goBack')}
          </Button>
        </motion.div>
      )}

      {/* Loading State - Show while fetching data */}
      {storeId && loading && (
        <motion.div 
          variants={itemVariants}
          className="p-6 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full flex-shrink-0"
          />
          <div>
            <p className="font-medium text-blue-900">{t('dashboard.loadingData')}</p>
            <p className="text-sm text-blue-700">{t('dashboard.fetchingStats', { storeName })}</p>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div 
          variants={itemVariants}
          className="p-6 bg-red-50 border border-red-200 rounded-xl"
        >
          <h2 className="text-lg font-semibold text-red-900 mb-2">{t('dashboard.errorLoading')}</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button 
            variant="secondary"
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
          >
            {t('dashboard.tryAgain')}
          </Button>
        </motion.div>
      )}

      {/* Only show content if we have storeId and data is loaded */}
      {storeId && !loading && !error && (
        <>
          {/* Header with Date Picker */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Left: Back Button */}
              {storeId && (
                <Button
                  variant="secondary"
                  onClick={() => navigate("/admin/stores")}
                  className="gap-2 w-full sm:w-auto order-first"
                >
                  <ArrowLeft size={18} />
                  {t('common.back')}
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {storeId ? t('dashboard.title') : t('dashboard.welcome')}
                </h1>
                <p className="text-slate-600">
                  {storeId ? t('dashboard.subtitle') : t('dashboard.welcome')}
                </p>
              </div>
              {/* Right: Date Picker & Export Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="relative">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full sm:w-auto text-sm relative"
                  >
                    {formatDateDisplay(tempStartDate)} - {formatDateDisplay(tempEndDate)}
                    {loading && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute right-2 w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full"
                      />
                    )}
                  </Button>
                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 mt-2 p-5 bg-white border border-slate-200 rounded-xl shadow-xl z-10 w-80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">{t('dashboard.startDate')}</label>
                          <input
                            type="date"
                            value={tempStartDate.toISOString().split('T')[0]}
                            onChange={handleStartDateChange}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">{t('dashboard.endDate')}</label>
                          <input
                            type="date"
                            value={tempEndDate.toISOString().split('T')[0]}
                            onChange={handleEndDateChange}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-slate-200">
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowDatePicker(false);
                            }}
                            className="flex-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            {t('common.close')}
                          </Button>
                          <Button
                            onClick={handleApplyDates}
                            disabled={false}
                            className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                          >
                            {t('common.apply')}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Export Buttons */}
                {apiData && apiData.ChiffreAffaire && (
                  <>
                    <PDFDownloadLink 
                      document={<ReportDocument 
                        data={apiData} 
                        storeInformation={storeName} 
                        date1={formatDateForAPI(startDate)} 
                        date2={formatDateForAPI(endDate)} 
                        t={t} 
                        lang={i18n.language || 'en'}
                      />}
                      fileName={`${storeName}_report_${formatDateForAPI(startDate)}_${formatDateForAPI(endDate)}.pdf`}
                    >
                      {({ blob, url, loading, error }) => (
                        <Button 
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm"
                          disabled={loading}
                        >
                          <FileDown size={18} /> {loading ? 'Generating...' : 'PDF'}
                        </Button>
                      )}
                    </PDFDownloadLink>
                    <Button 
                      onClick={() => generateExcel(apiData, storeName, formatDateForAPI(startDate), formatDateForAPI(endDate), t)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-auto text-sm"
                    >
                      <FileDown size={18} /> Excel
                    </Button>
                  </>
                )}

              </div>
            </div>
          </motion.div>

          {/* Stats Grid - Main Metrics */}
          {/* <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
        {loading && (
          <div className="col-span-full text-center text-sm text-slate-500">Loading store metrics...</div>
        )}
        {error && (
          <div className="col-span-full text-center text-sm text-red-500">{error}</div>
        )}
        <StatCard
          icon={ShoppingBag}
          label={t('dashboard.totalStores')}
          value={stats.totalStores}
          trend="12% increase"
        />
        <StatCard
          icon={DollarSign}
          label={t('dashboard.totalSales')}
          value={stats.totalSales}
          trend="8% increase"
        />
        <StatCard
          icon={Users}
          label={t('dashboard.totalUsers')}
          value={stats.totalUsers}
          trend="15% increase"
        />
        <StatCard
          icon={ShoppingBag}
          label={t('dashboard.activeOrders')}
          value={stats.activeOrders}
          trend="5% increase"
        />
      </motion.div> */}

      {/* Additional Stats Grid - Taxes & Orders */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          icon={DollarSign}
          label={t('dashboard.totalSales')}
          value={stats.totalSales}
          trend="8% increase"
        />
        <StatCard
          icon={DollarSign}
          label={t('dashboard.taxes')}
          value={stats.taxes}
          trend="2% increase"
        />
        <StatCard
          icon={DollarSign}
          label={t('dashboard.taxExclusive')}
          value={stats.taxExclusive}
          trend="7% increase"
        />
        <StatCard
          icon={ShoppingBag}
          label={t('dashboard.totalOrders')}
          value={stats.totalOrders}
          trend="10% increase"
        />
      </motion.div>

      {/* Payment & Fulfillment Methods Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('dashboard.paymentFulfillment')}</h2>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Payment Methods */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wallet size={22} className="text-slate-700" />
                  <CardTitle>{t('dashboard.paymentMethods')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.paymentMethods).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(stats.paymentMethods).map(([method, data]) => {
                      const totalAmount = Object.values(stats.paymentMethods).reduce((sum, m) => sum + m.amount, 0);
                      const percentage = totalAmount > 0 ? ((data.amount / totalAmount) * 100).toFixed(1) : 0;
                      const methodInfo = paymentMethodLabels[method] || { label: method.replace(/_/g, ' '), icon: DollarSign, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200", barColor: "bg-slate-600" };
                      const IconComponent = methodInfo.icon;
                      
                      return (
                        <div key={method} className={`flex items-center gap-3 p-4 ${methodInfo.bgColor} rounded-lg border ${methodInfo.borderColor}`}>
                          <div className={`flex-shrink-0 p-3 rounded-lg bg-white`}>
                            <IconComponent size={20} className={methodInfo.color} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-slate-900">{methodInfo.label}</p>
                              <p className="text-sm font-bold text-slate-900">{data.amount.toFixed(2)}{stats.devise}</p>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`${methodInfo.barColor} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-600 mt-1\">{percentage}{t('dashboard.percentOfTotal')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-6">{t('dashboard.noPaymentData')}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Fulfillment Methods */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package size={22} className="text-slate-700" />
                  <CardTitle>{t('dashboard.fulfillmentMethods')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.fulfillmentMethods).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(stats.fulfillmentMethods).map(([method, data]) => {
                      const totalAmount = Object.values(stats.fulfillmentMethods).reduce((sum, m) => sum + m.amount, 0);
                      const percentage = totalAmount > 0 ? ((data.amount / totalAmount) * 100).toFixed(1) : 0;
                      const methodInfo = fulfillmentMethodLabels[method] || { label: method.replace(/_/g, ' '), icon: ShoppingBag, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200", barColor: "bg-slate-600" };
                      const IconComponent = methodInfo.icon;
                      
                      return (
                        <div key={method} className={`flex items-center gap-3 p-4 ${methodInfo.bgColor} rounded-lg border ${methodInfo.borderColor}`}>
                          <div className={`flex-shrink-0 p-3 rounded-lg bg-white`}>
                            <IconComponent size={20} className={methodInfo.color} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-slate-900">{methodInfo.label}</p>
                              <p className="text-sm font-bold text-slate-900">{data.amount.toFixed(2)}{stats.devise}</p>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`${methodInfo.barColor} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{percentage}{t('dashboard.percentOfTotal')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-6">{t('dashboard.noFulfillmentData')}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Orders listing table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('dashboard.orders')}</h2>

        {/* filters */}
        {ordersError && (
          <div className="text-red-500 mb-2">{ordersError}</div>
        )}
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setOrdersPage(1); }}
            placeholder={t('dashboard.searchOrders')}
            className="border p-2 rounded w-full sm:w-auto"
          />
          <input
            type="date"
            value={orderDate.toISOString().split('T')[0]}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              setOrderDate(newDate);
              setOrdersPage(1);
            }}
            className="border p-2 rounded"
          />
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setOrdersPage(1); }}
            className="border p-2 rounded"
          >
            <option value="">{t('dashboard.paymentFilter')}</option>
            <option value="CARD">{t('paymentMethods.card')}</option>
            <option value="CASH">{t('paymentMethods.cash')}</option>
            <option value="MEAL_VOUCHER">{t('paymentMethods.mealVoucher')}</option>
            <option value="CHECK">{t('paymentMethods.check')}</option>
            <option value="FIDELITY_POINTS">{t('paymentMethods.fidelityPoints')}</option>
            <option value="STORE_CREDIT">{t('paymentMethods.storeCredit')}</option>
            <option value="CORPORATE_ACCOUNT">{t('paymentMethods.corporateAccount')}</option>
          </select>
          <select
            value={fulfillmentFilter}
            onChange={(e) => { setFulfillmentFilter(e.target.value); setOrdersPage(1); }}
            className="border p-2 rounded"
          >
            <option value="">{t('dashboard.fulfillmentFilter')}</option>
            <option value="Dine-in">{t('fulfillmentMethods.dineIn')}</option>
            <option value="Takeaway">{t('fulfillmentMethods.takeaway')}</option>
            <option value="Delivery">{t('fulfillmentMethods.delivery')}</option>
          </select>
          <select
            value={shiftFilter}
            onChange={(e) => {
              const newShift = e.target.value;
              const availableShifts = [];
              const seen = new Set();
              orders.forEach(order => {
                const raw = getRawZ(order);
                if (!raw || seen.has(raw)) return;
                seen.add(raw);
                availableShifts.push(getShiftKey(order));
              });
              const sortedAvailable = availableShifts.sort(sortShiftKeys).join(', ');
              console.log(`[Z_FILTER] User selected Z: ${newShift || 'ALL'} | Available: [${sortedAvailable}]`);
              setShiftFilter(newShift);
              setOrdersPage(1);
            }}
            className="border p-2 rounded"
          >
            <option value="">Filter by Z</option>
            {orders.length > 0 && (() => {
              const options = [];
              const seen = new Set();
              orders.forEach(order => {
                const raw = getRawZ(order);
                if (!raw || seen.has(raw)) return;
                seen.add(raw);
                options.push({ raw, formatted: getShiftKey(order) });
              });
              return options
                .sort((a, b) => sortShiftKeys(a.formatted, b.formatted))
                .map((opt) => (
                  <option key={opt.raw} value={opt.raw}>
                    Z {opt.formatted}
                  </option>
                ));
            })()}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">{t('dashboard.ticketNumber')}</th>
                <th className="px-3 py-2 text-left">{t('common.date')}</th>
                <th className="px-3 py-2 text-left">{t('common.time')}</th>
                <th className="px-3 py-2 text-left">{t('dashboard.customer')}</th>
                <th className="px-3 py-2 text-right">{t('dashboard.orderTotal')}</th>
                <th className="px-3 py-2 text-left">Z</th>
                <th className="px-3 py-2 text-left">{t('dashboard.paymentFilter')}</th>
                <th className="px-3 py-2 text-left">{t('dashboard.fulfillmentFilter')}</th>
                <th className="px-3 py-2 text-center">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                    <tr key={order._id} className="even:bg-slate-50">
                      <td className="px-3 py-2">{order.idTiquer}</td>
                      <td className="px-3 py-2">
                        {order.Date ? formatDateDisplay(
                          new Date(order.Date.slice(0, 4), parseInt(order.Date.slice(4, 6)) - 1, order.Date.slice(6, 8))
                        ) : order.Date}
                      </td>
                      <td className="px-3 py-2">{order.HeureTicket || '-'}</td>
                      <td className="px-3 py-2">
                        {order.Signature || order.customerName || '-'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {order.TTC != null ? `€ ${order.TTC.toFixed(2)}` : ''}
                      </td>
                      <td className="px-3 py-2 font-semibold text-blue-600">
                        {(() => {
                          const shiftKey = getShiftKey(order);
                          return shiftKey ? `Z ${shiftKey}` : '-';
                        })()}
                      </td>
                      <td className="px-3 py-2">
                        {order.PaymentMethods
                          ? order.PaymentMethods.map(p => {
                              const method = p.payment_method || p.ModePaiement || '';
                              const methodInfo = paymentMethodLabels[method];
                              return methodInfo ? methodInfo.label : method;
                            }).join(', ')
                          : (order.ModePaiement && Array.isArray(order.ModePaiement) 
                              ? order.ModePaiement.map(p => {
                                  const method = p.ModePaiement || '';
                                  const methodInfo = paymentMethodLabels[method];
                                  return methodInfo ? methodInfo.label : method;
                                }).join(', ') 
                              : (paymentMethodLabels[order.ModePaiement] ? paymentMethodLabels[order.ModePaiement].label : order.ModePaiement || ''))}
                      </td>
                      <td className="px-3 py-2">
                        {(() => {
                          const raw = order.ModeConsomation || order.ConsumptionMode || '';
                          const normalized = normalizeFulfillmentMethod(raw);
                          return fulfillmentMethodLabels[normalized]?.label || raw;
                        })()}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleViewTicket(order)}
                          className="inline-flex items-center justify-center p-2 hover:bg-green-100 rounded transition-colors"
                          title={t('common.view')}
                        >
                          <Eye size={18} className="text-green-600" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex justify-between items-center mt-2">
          <span>
            {t('common.page')} {ordersPage} {t('common.of')} {Math.ceil(ordersTotal / ordersLimit) || 1}
          </span>
          <div className="space-x-2">
            <button
              disabled={ordersPage <= 1}
              onClick={() => setOrdersPage((p) => Math.max(p - 1, 1))}
              className="px-2 py-1 bg-slate-200 rounded disabled:opacity-50"
            >
              {t('common.previous')}
            </button>
            <button
              disabled={ordersPage >= Math.ceil(ordersTotal / ordersLimit)}
              onClick={() => setOrdersPage((p) => p + 1)}
              className="px-2 py-1 bg-slate-200 rounded disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('dashboard.productPerformance')}</h2>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
        {/* Top 5 Products */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.topBestSellers')}</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts && topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-200">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-full font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-sm font-bold text-slate-900">{product.amount.toFixed(2)}{stats.devise}</p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${product.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{product.percentage}{t('dashboard.ofTotalSales')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6">{t('dashboard.noProductDataAvailable')}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom 5 Products */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.bottomLowPerformers')}</CardTitle>
            </CardHeader>
            <CardContent>
              {bottomProducts && bottomProducts.length > 0 ? (
                <div className="space-y-3">
                  {bottomProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-orange-200">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-600 text-white rounded-full font-bold text-sm">
                        {bottomProducts.length - index}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-sm font-bold text-slate-900">{product.amount.toFixed(2)}{stats.devise}</p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${product.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{product.percentage}{t('dashboard.ofTotalSales')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6">{t('dashboard.noProductDataAvailable')}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <p className="text-slate-700">{t('dashboard.newOrderReceived')}</p>
                  <span className="ml-auto text-xs text-slate-500">{t('dashboard.hoursAgo', { hours: 2 })}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ticket Receipt Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t('common.ticket')} #{selectedTicket?.idTiquer}
                </h3>
                <p className="text-sm text-slate-600">
                  {selectedTicket?.Date ? formatDateDisplay(
                    new Date(selectedTicket.Date.slice(0, 4), parseInt(selectedTicket.Date.slice(4, 6)) - 1, selectedTicket.Date.slice(6, 8))
                  ) : ''} {selectedTicket?.HeureTicket ? `- ${selectedTicket.HeureTicket}` : ''}
                </p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {ticketLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"
                    />
                    <p className="text-slate-600">{t('common.loading')}</p>
                  </div>
                </div>
              ) : ticketContent ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <iframe
                    srcDoc={ticketContent}
                    className="w-full h-[500px] border-0 bg-white rounded"
                    title="Ticket Receipt"
                  />
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-600">{t('common.noData')}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex gap-2 justify-end p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-colors font-medium"
              >
                {t('common.close')}
              </button>
              {ticketContent && (
                <button
                  onClick={() => {
                    const printWindow = window.open('', '', 'height=600,width=800');
                    printWindow.document.write(ticketContent);
                    printWindow.document.close();
                    printWindow.print();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {t('common.print')}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
        </>
      )}
    </motion.div>
  );
}

export default Dashboard;
