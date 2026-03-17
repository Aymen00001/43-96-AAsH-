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

function Dashboard() {
  renderCount++;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const storeId = Cookies.get("idCRM");
  const storeName = Cookies.get("Name");

  console.log(`🔄 [DASHBOARD_RENDER] Render #${renderCount} | StoreID: ${storeId} | Time: ${new Date().toLocaleTimeString()}`);

  // Debug logging
  useEffect(() => {
    console.log("🚀 [DASHBOARD_INIT] Component mounting for store:", storeId);
    console.log("[DASHBOARD_INIT] Store Name:", storeName || "N/A");
    
    // Check all cookies
    const allCookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});
    
    console.log("[DASHBOARD] Session data available:", Object.keys(allCookies).length > 0);
    if (!storeId) {
      console.warn("[DASHBOARD] Warning: Store ID not found");
    }
  }, []);

  // Payment method translations and icons
  const paymentMethodLabels = {
    "CARTE_BANCAIRE": { label: t('paymentMethods.cardPayment'), icon: CreditCard, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", barColor: "bg-blue-600" },
    "ESPECES": { label: t('paymentMethods.cash'), icon: Banknote, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", barColor: "bg-green-600" },
    "TICKET_RESTO": { label: t('paymentMethods.mealVoucher'), icon: UtensilsCrossed, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", barColor: "bg-orange-600" },
    "AVOIR": { label: t('paymentMethods.AVOIR'), icon: Wallet, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200", barColor: "bg-purple-600" }
  };

  // Fulfillment method translations and icons
  const fulfillmentMethodLabels = {
    "SurPlace": { label: t('fulfillmentMethods.dineIn'), icon: Users, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", barColor: "bg-indigo-600" },
    "A_Emporter": { label: t('fulfillmentMethods.takeaway'), icon: ShoppingBag, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200", barColor: "bg-purple-600" },
    "Livraison": { label: t('fulfillmentMethods.delivery'), icon: Truck, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", barColor: "bg-red-600" }
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

  // Modal state for ticket display
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketContent, setTicketContent] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Date picker state
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

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
      const params = {
        idCRM: storeId,
        date1: formatDateForAPI(startDate),
        date2: formatDateForAPI(endDate),
        page: ordersPage,
        limit: ordersLimit,
      };
      if (searchTerm) params.search = searchTerm;
      if (paymentFilter) params.paymentMethod = paymentFilter;
      if (fulfillmentFilter) params.fulfillmentMode = fulfillmentFilter;

      console.log("📦 [FETCH_ORDERS] params", params);
      const response = await UserService.GetTickets(params);
      setOrders(response.data || []);
      setOrdersTotal(response.totalCount || 0);
    } catch (err) {
      console.error("[FETCH_ORDERS] error", err);
      setOrdersError(err?.toString() || "Error fetching orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // reload orders when any relevant parameter changes
  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate, searchTerm, paymentFilter, fulfillmentFilter, ordersPage, ordersLimit]);

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
      
      console.log("📋 [VIEW_TICKET] Fetching from:", url);
      console.log("📋 [VIEW_TICKET] Details - idCRM:", idCRM, "Date:", date, "TicketID:", ticketId);
      const response = await axios.get(url);
      setTicketContent(response.data);
    } catch (err) {
      console.error("[VIEW_TICKET] Error fetching ticket:", err);
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
    const timestamp = new Date().toLocaleTimeString();
    renderCount++;
    console.group(`🚀 [DASHBOARD_MOUNT] ${timestamp} - Render #${renderCount}`);
    console.log(`Component mounted/re-rendered`);
    console.log(`Store ID: "${storeId}"`);
    console.log(`Store Name: "${storeName}"`);
    console.groupEnd();
  }, []); // Empty dependency array - runs once on mount

  useEffect(() => {
    const effectTimestamp = new Date().toLocaleTimeString();
    const effectTime = new Date().getTime();
    const effectId = Math.random().toString(36).substr(2, 9);
    
    console.group(`🔄 [EFFECT_TRIGGER:${effectId}] ${effectTimestamp}`);
    console.log(`Store ID: "${storeId}"`);
    console.log(`Start date: ${startDate?.toDateString()} (${startDate?.getTime()})`);
    console.log(`End date: ${endDate?.toDateString()} (${endDate?.getTime()})`);
    console.log(`Loading state: ${loading}`);
    console.groupEnd();
    
    // Update temp dates to match actual dates
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    
    async function fetchStoreMetrics() {
      const callTimestamp = new Date().toLocaleTimeString();
      const callId = Math.random().toString(36).substr(2, 9);
      
      console.group(`📡 [API_CALL:${callId}] ${callTimestamp}`);
      console.log(`Effect ID: ${effectId}`);
      console.log(`Starting fetch...`);
      
      if (!storeId) {
        console.warn(`Store ID missing - aborting fetch`);
        console.groupEnd();
        return;
      }
      
      // Only show loading on initial load, not on date changes
      if (initialLoad.current) {
        console.log(`Initial load - showing loading state`);
        setLoading(true);
        initialLoad.current = false;
      } else {
        console.log(`Date change fetch - silent background update`);
      }
      
      setError(null);
      console.log(`[API_CALL:${callId}] Error state cleared`);

      const apiBase = import.meta.env.VITE_API_URL || "https://api-statistics.makseb.fr";
      const baseUrl = apiBase.replace(/\/$/, "");

      const date1 = formatDateForAPI(startDate);
      const date2 = formatDateForAPI(endDate);

      console.log(`[API_CALL:${callId}] API Configuration - Base: ${baseUrl}`);
      console.log(`[API_CALL:${callId}] Date range: ${date1} to ${date2}`);

      try {
        // Fetch sales summary (includes revenue and payment methods breakdown)
        const salesUrl = `${baseUrl}/get-sales-summary?idCRM=${encodeURIComponent(storeId)}&date1=${date1}&date2=${date2}`;
        console.log(`[API_CALL:${callId}] 📤 Making request to: ${salesUrl}`);
        
        const startTime = performance.now();
        console.log(`[API_CALL:${callId}] Request timestamp: ${new Date().toLocaleTimeString()}`);
        const salesRes = await axios.get(salesUrl);
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        console.log(`[API_CALL:${callId}] 📥 Response received in ${duration}ms`);
        console.log(`[API_CALL:${callId}] Status: ${salesRes.status}`);
        console.log(`[API_CALL:${callId}] Response timestamp: ${new Date().toLocaleTimeString()}`);
        console.log(`[API_CALL:${callId}] Processing response data...`);
        const salesData = salesRes.data?.data;

        if (!salesData) {
          throw new Error("No data field in response");
        }

        // Extract and analyze product data
        console.log(`[API_CALL:${callId}] Analyzing sales data...`);
        console.log(`[API_CALL:${callId}]    salesData keys:`, Object.keys(salesData));
        console.log(`[API_CALL:${callId}]    ProduitDetailler exists?`, !!salesData.ProduitDetailler);
        console.log(`[API_CALL:${callId}]    ProduitDetailler value:`, salesData.ProduitDetailler);
        
        const productData = {};

        // Check for product details in the response
        if (salesData.ProduitDetailler && typeof salesData.ProduitDetailler === 'object') {
          console.log(`[API_CALL:${callId}] Product details found`);
          console.log(`[API_CALL:${callId}] Processing ${Object.keys(salesData.ProduitDetailler).length} products`);
          
          Object.entries(salesData.ProduitDetailler).forEach(([productName, details], idx) => {
            console.log(`[API_CALL:${callId}] Product ${idx}: "${productName}"`);
            console.log(`[API_CALL:${callId}] Details available:`, !!details);
            
            if (details && typeof details === 'object') {
              console.log(`[API_CALL:${callId}]      Details keys:`, Object.keys(details));
              
              // Extract amount - try multiple field names
              let amount = 0;
              let foundField = null;
              
              const fieldNames = ['Somme', 'Total_TTC', 'TotalTTC', 'total', 'amount', 'Montant', 'MontantTTC', 'montantTTC'];
              for (const field of fieldNames) {
                if (details[field] !== undefined) {
                  amount = parseFloat(details[field]) || 0;
                  foundField = field;
                  break;
                }
              }
              
              const quantity = details.Quantite || details.Qty || details.Count || 0;
              
              console.log(`[API_CALL:${callId}]      Amount: ${amount} (from field: ${foundField})`);
              console.log(`[API_CALL:${callId}]      Quantity: ${quantity}`);
              
              productData[productName] = {
                name: productName,
                amount: parseFloat(amount) || 0,
                quantity: parseInt(quantity) || 0
              };
            } else {
              console.log(`[API_CALL:${callId}] Warning: Details object malformed`);
            }
          });
        }

        console.log(`[API_CALL:${callId}] Summary: Found ${Object.keys(productData).length} products`);

        // Calculate total product sales and sort
        const totalProductSales = Object.values(productData).reduce((sum, p) => sum + (p.amount || 0), 0);

        const sortedProducts = Object.values(productData)
          .map(p => ({
            ...p,
            percentage: totalProductSales > 0 ? ((p.amount / totalProductSales) * 100).toFixed(1) : 0
          }))
          .sort((a, b) => b.amount - a.amount);

        console.log(`[API_CALL:${callId}] Products sorted by revenue`);

        // Get top 5 and bottom 5
        const top5 = sortedProducts.slice(0, 5);
        const bottom5 = sortedProducts.slice(-5).reverse();

        console.log(`[API_CALL:${callId}] Top 5 products loaded`);
        console.log(`[API_CALL:${callId}] Bottom 5 products loaded`);
        console.log(`[API_CALL:${callId}] Calling setTopProducts and setBottomProducts`);

        setTopProducts(top5);
        setBottomProducts(bottom5);



        // Build payment methods breakdown from modePaiement
        const paymentMethods = {};
        let totalPaymentAmount = 0;
        
        console.log(`[API_CALL:${callId}] Processing payment methods...`);
        if (salesData.modePaiement && typeof salesData.modePaiement === 'object') {
          Object.entries(salesData.modePaiement).forEach(([method, amount]) => {
            const cleanAmount = parseFloat(amount) || 0;
            paymentMethods[method] = {
              amount: cleanAmount,
              count: 0, // Not available in this endpoint
              average: 0, // Not available in this endpoint
            };
            totalPaymentAmount += cleanAmount;
          });
          console.log(`[API_CALL:${callId}] Payment methods found: ${Object.keys(paymentMethods).length}`);
        }

        // Build fulfillment methods breakdown from modeConsommation
        const fulfillmentMethods = {};
        console.log(`[API_CALL:${callId}] Processing fulfillment methods...`);
        if (salesData.modeConsommation && typeof salesData.modeConsommation === 'object') {
          Object.entries(salesData.modeConsommation).forEach(([method, amount]) => {
            const cleanAmount = parseFloat(amount) || 0;
            fulfillmentMethods[method] = {
              amount: cleanAmount,
            };
          });
          console.log(`[API_CALL:${callId}] Fulfillment methods found: ${Object.keys(fulfillmentMethods).length}`);
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
        const totalOrdersCount = Object.values(paymentMethods).reduce((sum, method) => sum + (method.count || 0), 0) || 
                                 salesData.EtatTiquer?.Encaiser || 0;

        console.log(`[DASHBOARD] Extracted data - Revenue: ${totalRevenue}`);
        console.log(`[DASHBOARD] Taxes: ${totalTaxes}`);
        console.log(`[DASHBOARD] Tax Exclusive: ${totalExcludingTax}`);
        console.log(`[DASHBOARD] Total products: ${Object.keys(productData).length}`);
        console.log(`[DASHBOARD] Payment methods: ${Object.keys(paymentMethods).length}`);
        console.log(`[DASHBOARD] Fulfillment methods: ${Object.keys(fulfillmentMethods).length}`);

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

        console.log(`[DASHBOARD] Stats updated`);
        console.log(`[API_CALL:${callId}] Calling setStats with: totalSales=${totalRevenue}, totalTaxes=${totalTaxes}`);
        setStats((s) => { 
          const newStats = { ...s, ...mapped };
          console.log(`[API_CALL:${callId}] setStats callback executed`);
          return newStats;
        });
        console.log(`[API_CALL:${callId}] Calling setApiData`);
        setApiData(salesData); // Store full API response for PDF/Excel export
        console.log(`[API_CALL:${callId}] State updates queued`);
      } catch (err) {
        console.error(`[API_CALL:${callId}] ❌ Error caught:`, err.message);
        console.error(`[API_CALL:${callId}] Error code: ${err.code}`);
        console.error(`[API_CALL:${callId}] Response status: ${err.response?.status}`);
        console.log(`[API_CALL:${callId}] Calling setError`);
        setError(`Failed to load store metrics: ${err.message}`);
        console.log(`[API_CALL:${callId}] Calling setDailySalesData with empty array`);
        setDailySalesData([]); // Clear chart data on error
      } finally {
        console.log(`[API_CALL:${callId}] Finally block reached - calling setLoading(false)`);
        setLoading(false);
        console.groupEnd();
      }
    }

    console.log(`[DASHBOARD] Fetching metrics`);
    fetchStoreMetrics();
    
    // Log effect cleanup
    return () => {
      console.group(`🧹 [EFFECT_CLEANUP:${effectId}]`);
      console.log(`Cleaning up effect ${effectId}`);
      console.log(`Effect will re-run when dependencies change: storeId, startDate, endDate`);
      console.groupEnd();
    };
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
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setOrdersPage(1); }}
            className="border p-2 rounded"
          >
            <option value="">{t('dashboard.paymentFilter')}</option>
            <option value="CARD">Card</option>
            <option value="CASH">Cash</option>
            <option value="TICKET_RESTO">Meal Voucher</option>
          </select>
          <select
            value={fulfillmentFilter}
            onChange={(e) => { setFulfillmentFilter(e.target.value); setOrdersPage(1); }}
            className="border p-2 rounded"
          >
            <option value="">{t('dashboard.fulfillmentFilter')}</option>
            <option value="SurPlace">{t('fulfillmentMethods.dineIn')}</option>
            <option value="A_Emporter">{t('fulfillmentMethods.takeaway')}</option>
            <option value="Livraison">{t('fulfillmentMethods.delivery')}</option>
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
                      <td className="px-3 py-2">
                        {order.PaymentMethods
                          ? order.PaymentMethods.map(p => p.payment_method || p.ModePaimeent).join(', ')
                          : (order.ModePaiement && Array.isArray(order.ModePaiement) ? order.ModePaiement.map(p => p.ModePaimeent).join(', ') : order.ModePaiement || '')}
                      </td>
                      <td className="px-3 py-2">{order.ModeConsomation || order.ConsumptionMode || ''}</td>
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
