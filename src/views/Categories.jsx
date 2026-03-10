import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Plus, Edit, Trash2 } from "lucide-react";

function Categories() {
  const [categories] = useState([
    { id: 1, name: "Electronics", count: 45 },
    { id: 2, name: "Clothing", count: 67 },
    { id: 3, name: "Food", count: 23 },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600">Manage product categories</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          Add Category
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Category List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">{cat.name}</p>
                    <p className="text-sm text-slate-600">{cat.count} products</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg">
                      <Edit size={16} className="text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default Categories;
