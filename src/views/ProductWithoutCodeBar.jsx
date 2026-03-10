import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";

function ProductWithoutCodeBar() {
  return (
    <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardHeader>
          <CardTitle>Add Product</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Add product page coming soon...</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ProductWithoutCodeBar;
