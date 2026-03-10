import React from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import routes from "../routes";

function AdminLayout() {
  console.log("[ADMINLAYOUT] Mounted -", routes.length, "routes");
  
  if (routes.length === 0) {
    console.error("[ADMINLAYOUT] Error: No routes configured");
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="flex flex-col h-screen bg-apple-50">
      <Navbar />
      
      <motion.main
        className="flex-1 overflow-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Routes>
          {routes.map((route) => (
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

export default AdminLayout;
