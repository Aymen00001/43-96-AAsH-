import React from "react";
import { motion } from "framer-motion";

function Footer() {
  return (
    <motion.footer
      className="bg-white border-t border-apple-200 text-center py-6 px-6"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <p className="text-xs text-apple-500">
        © {new Date().getFullYear()} Makseb Solution. All rights reserved.
      </p>
      <p className="text-xs text-apple-400 mt-2">
        Designed with precision. Built to perform.
      </p>
    </motion.footer>
  );
}

export default Footer;
