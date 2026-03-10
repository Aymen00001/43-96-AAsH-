import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";

function QRScanner() {
  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">QR code scanner feature coming soon...</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default QRScanner;
