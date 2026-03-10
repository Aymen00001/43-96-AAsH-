import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { Lock, User, AlertCircle } from "lucide-react";
import Auth from "../Service/Auth";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

function Login() {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (delay) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.4, ease: "easeOut" },
    }),
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("[LOGIN] Authenticating user...");

    try {
      const response = await Auth.signIn(username, password);
      
      if (response && response.access_token) {
        // Wait for cookies to be fully set by Auth service
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify all cookies are properly set
        const token = Cookies.get("access_token");
        const name = Cookies.get("Name");
        const idCRM = Cookies.get("idCRM");
        const role = Cookies.get("Role");
        const setting = Cookies.get("Setting");
        
        const decoded = jwtDecode(response.access_token);
        console.log("[LOGIN] Session data verified");
        
        // Determine redirect based on role
        const userRole = role || decoded.Role || decoded.role;
        
        if (userRole === "admin") {
          console.log("[LOGIN] Admin access - redirecting to stores");
          window.location.href = "/admin/stores";
        } else if (userRole === "store") {
          console.log("[LOGIN] Store access - redirecting to dashboard");
          window.location.href = "/admin/dashboard";
        } else {
          console.error("[LOGIN] Unknown user role:", userRole);
          setError("Unknown user role. Please contact support.");
        }
      } else {
        console.error("[LOGIN] No access token in response");
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("[LOGIN] Authentication error:", err.message);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-10"
      >
        {/* Header */}
        <motion.div 
          custom={0.1}
          variants={itemVariants}
          className="text-center space-y-2"
        >
          <h1 className="text-5xl font-semibold text-apple-900 tracking-tight">
            Makseb
          </h1>
          <p className="text-lg text-apple-500 font-normal">
            Statistics System
          </p>
          <div className="mt-2 flex justify-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`text-xs px-2 py-1 border rounded ${i18n.language === 'en' ? 'bg-gray-900 text-white' : 'bg-white'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage('es')}
                className={`text-xs px-2 py-1 border rounded ${i18n.language === 'es' ? 'bg-gray-900 text-white' : 'bg-white'}`}
              >
                ES
              </button>
             
              <button
                type="button"
                onClick={() => i18n.changeLanguage('fr')}
                className={`text-xs px-2 py-1 border rounded ${i18n.language === 'fr' ? 'bg-gray-900 text-white' : 'bg-white'}`}
              >
                FR
              </button>
               <button
                type="button"
                onClick={() => i18n.changeLanguage('ar')}
                className={`text-xs px-2 py-1 border rounded ${i18n.language === 'ar' ? 'bg-gray-900 text-white' : 'bg-white'}`}
              >
                AR
              </button>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          custom={0.2}
          variants={itemVariants}
          className="space-y-6"
        >
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-label">
                {t('login.email')}
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-apple-500"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.username"
                  required
                  className="input-primary pl-12"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-label">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-apple-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-primary pl-12"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3"
              >
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm leading-snug">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Sign In Button */}
            <motion.button
              custom={0.35}
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
                         text-white font-medium rounded-lg 
                         transition-colors duration-200 ease-out
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  {t('login.authenticating')}
                </span>
              ) : (
                t('login.signIn')
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          custom={0.45}
          variants={itemVariants}
          className="pt-6 border-t border-apple-200 text-center"
        >
          <p className="text-sm text-apple-600">
            Contact your administrator for demo credentials
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
