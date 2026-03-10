import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import routes from "../routes";

function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <motion.main
        className="flex-1 overflow-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Routes>
          {routes
            .filter((r) => r.layout === "/client")
            .map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.component}
              />
            ))}
        </Routes>
      </motion.main>
      
      <Footer />
    </div>
  );
}

export default ClientLayout;
