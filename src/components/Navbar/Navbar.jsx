import React, { useState } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Get user info from cookies
  const userName = Cookies.get("Name") || "User";
  const userRole = Cookies.get("Role") || "store";
  
  const handleLogout = () => {
    console.log("[NAVBAR] Logout initiated");
    setShowDropdown(false);
    // Navigate to logout route
    navigate("/logout");
  };

  return (
    <motion.nav
      className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-apple-200 shadow-xs"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left side - Logo */}
        <h1 className="text-2xl font-semibold text-apple-900 tracking-tight">
          Makseb
        </h1>

        {/* Right side - Profile dropdown */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-4 border-l border-apple-200 hover:bg-apple-50 rounded-lg px-3 py-2 transition-colors duration-200"
              aria-label="User profile menu"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-apple-900">{userName}</p>
                <p className="text-xs text-apple-500 capitalize">{userRole}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200">
                <User size={18} className="text-blue-600" />
              </div>
              <ChevronDown 
                size={16} 
                className={`text-apple-600 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-apple-200 overflow-hidden z-50"
                >
                  {/* Profile Header */}
                  <div className="px-4 py-3 border-b border-apple-100 bg-apple-50">
                    <p className="text-sm font-semibold text-apple-900">{userName}</p>
                    <p className="text-xs text-apple-500 capitalize">{userRole} {t('common.account')}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        // Navigate to profile
                        navigate("/admin/profile");
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-apple-900 hover:bg-apple-50 flex items-center gap-3 transition-colors duration-150"
                    >
                      <User size={16} className="text-apple-600" />
                      <span>{t('navbar.profileSettings')}</span>
                    </button>
                  </div>

                  {/* Logout Divider and Button */}
                  <div className="border-t border-apple-100">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors duration-150 font-medium"
                    >
                      <LogOut size={16} />
                      <span>{t('navbar.logOut')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
