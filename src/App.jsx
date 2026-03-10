import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";
import Login from "./views/Login";
import Logout from "./views/Logout";
import Cookies from "js-cookie";

function App() {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    userRole: null,
  });

  useEffect(() => {
    // Check authentication state on app load
    const token = Cookies.get("access_token");
    const role = Cookies.get("Role");

    console.log("[APP] Initializing");

    if (token && role) {
      console.log("[APP] Authentication OK - Role:", role);
      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        userRole: role,
      });
    } else if (token && !role) {
      console.warn("[APP] Invalid state - token without role");
      // Clear invalid auth
      Cookies.remove("access_token");
      Cookies.remove("Name");
      Cookies.remove("idCRM");
      Cookies.remove("Setting");
      Cookies.remove("userid");
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        userRole: null,
      });
    } else {
      console.log("[APP] Not authenticated");
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        userRole: null,
      });
    }
  }, []);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-apple-600 font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Logout route - accessible at top level, BEFORE auth check */}
      <Route path="/logout" element={<Logout />} />

      {/* Login route - Public, but redirect if already authenticated */}
      <Route 
        path="/login" 
        element={authState.isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />

      {authState.isAuthenticated ? (
        <>
          {/* Admin and Client layouts */}
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/client/*" element={<ClientLayout />} />

          {/* Role-based home redirect */}
          {authState.userRole === "admin" ? (
            <Route path="/" element={<Navigate to="/admin/stores" replace />} />
          ) : authState.userRole === "store" ? (
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          ) : (
            <Route path="/" element={<Navigate to="/login" replace />} />
          )}
        </>
      ) : (
        <>
          {/* Unauthenticated - block all protected routes */}
          <Route path="/admin/*" element={<Navigate to="/login" replace />} />
          <Route path="/client/*" element={<Navigate to="/login" replace />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
