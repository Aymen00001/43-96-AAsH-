import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function Logout() {
  const { t } = useTranslation();
  useEffect(() => {
    console.log("[LOGOUT] Session terminating...");
    
    // Clear ALL authentication cookies
    Cookies.remove('access_token');
    Cookies.remove('isLoggedIn');
    Cookies.remove('Name');
    Cookies.remove('idCRM');
    Cookies.remove('idCRMClient');
    Cookies.remove('Setting');
    Cookies.remove('Role');
    Cookies.remove('userid');
    
    console.log("[LOGOUT] Session cleared");
    
    // Use hard redirect (100% reliable) instead of navigate()
    const timer = setTimeout(() => {
      console.log("[LOGOUT] Redirecting to login");
      window.location.href = '/login';
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-apple-200 border-t-blue-600 rounded-full mx-auto"
        />
        <p className="text-apple-600 font-medium">{t('logout.sessionTerminating')}</p>
      </motion.div>
    </div>
  );
}

export default Logout;
