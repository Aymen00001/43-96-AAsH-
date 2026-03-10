import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import maksebLogo from "../../maksebLogo.png";
import routes from "../../routes";

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  };

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className="fixed lg:static left-0 top-0 z-40 h-screen w-64 bg-white border-r border-apple-200 overflow-y-auto transform transition-transform duration-300 lg:translate-x-0"
        variants={sidebarVariants}
        initial={isOpen ? "visible" : "hidden"}
        animate={isOpen ? "visible" : "hidden"}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden p-6 flex justify-between items-center border-b border-apple-200">
          <h1 className="text-lg font-semibold text-apple-900">Menu</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="btn-icon"
          >
            <X size={24} className="text-apple-700" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="p-6 border-b border-apple-200">
          <div className="flex justify-center mb-4">
            <img
              src={maksebLogo}
              alt="Makseb Logo"
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-center text-sm font-semibold text-apple-900">
            Makseb Solution
          </h2>
          <p className="text-center text-xs text-apple-500 mt-1">
            Management System
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {routes.map((route) => {
            if (route.name === "Logout" || route.name === "Logout (Déconnexion)") {
              return null;
            }

            const isActive = activeRoute(route.path);

            return (
              <NavLink
                key={route.path}
                to={route.layout + route.path}
                onClick={() => setTimeout(() => setIsOpen(false), 300)}
                className={() =>
                  isActive
                    ? "nav-item-active flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                    : "sidebar-nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                }
              >
                {route.icon && (
                  <span className="text-xl flex-shrink-0">{route.icon}</span>
                )}
                <span className="font-medium text-base">{route.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}

export default Sidebar;
