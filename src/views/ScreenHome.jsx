import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Trash2, Plus, Edit, X, AlertCircle, CheckCircle, Eye, Wifi, WifiOff, ShieldCheck, ShieldOff } from "lucide-react";
import AdminService from "../Service/AdminService";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import Cookies from "js-cookie";

function ScreenHome() {
  const { t } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Helper function to translate license status for display
  const getLicenseStatusDisplay = (licenseValue) => {
    return licenseValue === "Enable" ? t('stores.enable') : t('stores.disable');
  };

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    Nom: "",
    Login: "",
    idCRM: "",
    Password: "",
    Email: "",
    Tel: "",
    Licence: "Enable",
  });

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const filtered = stores.filter(
      (store) =>
        store.Nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.Login.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [searchQuery, stores]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getAllStores();
      setStores(data.data || data || []);
    } catch (err) {
      setError(err.message || t('stores.notification.addError'));
      showNotification(t('stores.notification.addError'), "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddStore = async () => {
    if (!formData.Nom || !formData.Login || !formData.idCRM || !formData.Password) {
      showNotification(t('stores.requiredFields'), "error");
      return;
    }

    try {
      const response = await AdminService.AjoutStores(formData);
      if (response.data) {
        setStores([...stores, response.data]);
        showNotification(t('stores.notification.addSuccess'), "success");
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      showNotification(err.message || t('stores.notification.addError'), "error");
    }
  };

  const handleUpdateStore = async () => {
    if (!selectedStore) {
      showNotification('No store selected', "error");
      return;
    }

    try {
      const updateData = {
        Nom: formData.Nom || selectedStore.Nom,
        Login: formData.Login || selectedStore.Login,
        Password: formData.Password || selectedStore.Password,
        idCRM: formData.idCRM || selectedStore.idCRM,
        Email: formData.Email || selectedStore.Email,
        Tel: formData.Tel || selectedStore.Tel,
      };

      // Validate required fields
      if (!updateData.Nom || !updateData.Login || !updateData.idCRM) {
        showNotification(t('stores.requiredFields'), "error");
        return;
      }

      await AdminService.UpdateStore(
        selectedStore._id,
        updateData.Nom,
        updateData.Login,
        updateData.Password,
        updateData.idCRM,
        updateData.Email,
        updateData.Tel,
        selectedStore.Setting
      );

      // Update license if changed
      if (formData.Licence && formData.Licence !== selectedStore.Licence) {
        await AdminService.UpdateLicence(selectedStore.idCRM, formData.Licence);
      }

      const updatedStores = stores.map((store) =>
        store._id === selectedStore._id
          ? {
              ...store,
              ...updateData,
              Licence: formData.Licence || store.Licence,
            }
          : store
      );
      setStores(updatedStores);
      showNotification(t('stores.notification.updateSuccess'), "success");
      setShowEditModal(false);
      setSelectedStore(null);
      resetForm();
    } catch (err) {
      console.error('Update error:', err);
      showNotification(err.message || t('stores.notification.updateError'), "error");
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedStore) return;

    try {
      await AdminService.DeleteUsers(selectedStore._id);
      setStores(stores.filter((store) => store._id !== selectedStore._id));
      showNotification(t('stores.notification.deleteSuccess'), "success");
      setShowDeleteModal(false);
      setSelectedStore(null);
    } catch (err) {
      showNotification(err.message || t('stores.notification.deleteError'), "error");
    }
  };

  const handleToggleLicense = async (store) => {
    try {
      const newLicense = store.Licence === "Enable" ? "Disable" : "Enable";
      await AdminService.UpdateLicence(store.idCRM, newLicense);

      const updatedStores = stores.map((s) =>
        s._id === store._id ? { ...s, Licence: newLicense } : s
      );
      setStores(updatedStores);
      showNotification(
        newLicense === "Enable" ? t('stores.notification.licenseEnabledSuccess') : t('stores.notification.licenseDisabledSuccess'),
        "success"
      );
    } catch (err) {
      showNotification(t('stores.notification.licenseError'), "error");
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (store) => {
    setSelectedStore(store);
    setFormData({
      Nom: store.Nom,
      Login: store.Login,
      idCRM: store.idCRM,
      Email: store.Email || "",
      Tel: store.Tel || "",
      Password: "",
      Licence: store.Licence || "Enable",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (store) => {
    setSelectedStore(store);
    setShowDeleteModal(true);
  };

  const handleViewStore = (store) => {
    // Store the selected store info in cookies and navigate to dashboard
    Cookies.set("idCRM", store.idCRM);
    Cookies.set("Name", store.Nom);
    navigate(`/admin/dashboard`);
  };

  const resetForm = () => {
    setFormData({
      Nom: "",
      Login: "",
      idCRM: "",
      Password: "",
      Email: "",
      Tel: "",
      Licence: "Enable",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('stores.title')}</h1>
          <p className="text-slate-600">{t('stores.subtitle')}</p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus size={18} />
          {t('stores.addStore')}
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <input
          type="text"
          placeholder={t('stores.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label={t('stores.searchPlaceholder')}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div variants={itemVariants} className="text-center py-8">
          <p className="text-slate-600">{t('stores.loadingStores')}</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      {/* Stores Table - Desktop View */}
      {!loading && filteredStores.length > 0 && (
        <motion.div variants={itemVariants} className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle>{t('stores.storeList')} ({filteredStores.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 font-semibold text-slate-700`}>
                        {t('stores.table.name')}
                      </th>
                      <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 font-semibold text-slate-700`}>
                        {t('stores.table.login')}
                      </th>
                      <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 font-semibold text-slate-700`}>
                        {t('stores.table.crmId')}
                      </th>
                      <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 font-semibold text-slate-700`}>
                        {t('stores.table.email')}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">
                        {t('stores.table.connection')}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">
                        {t('stores.table.license')}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">
                        {t('stores.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStores.map((store) => (
                      <tr key={store._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-slate-900 font-medium`}>{store.Nom}</td>
                        <td className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-slate-600`}>{store.Login}</td>
                        <td className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-slate-600`}>{store.idCRM}</td>
                        <td className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-slate-600`}>{store.Email || "-"}</td>
                        <td className="py-3 px-4 text-center align-middle">
                          <div className="flex justify-center items-center">
                            {store.Status === "Activer" ? (
                              <Wifi size={16} className="text-blue-600" title={store.Status} />
                            ) : (
                              <WifiOff size={16} className="text-orange-500" title={store.Status} />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center justify-center p-2" title={getLicenseStatusDisplay(store.Licence)}>
                            {store.Licence === "Enable" ? (
                              <ShieldCheck size={16} className="text-green-600" />
                            ) : (
                              <ShieldOff size={16} className="text-red-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewStore(store)}
                              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                              title={t('stores.button.view')}
                              aria-label={t('stores.button.view')}
                            >
                              <Eye size={16} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => openEditModal(store)}
                              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                              title={t('stores.button.edit')}
                              aria-label={t('stores.button.edit')}
                            >
                              <Edit size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(store)}
                              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                              title={t('stores.button.delete')}
                              aria-label={t('stores.button.delete')}
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stores Cards - Mobile View */}
      {!loading && filteredStores.length > 0 && (
        <motion.div variants={itemVariants} className="md:hidden space-y-2">
          {filteredStores.map((store) => (
            <motion.div key={store._id} className="bg-white border border-slate-200 rounded-lg">
              <div
                onClick={() =>
                  setSelectedStore(selectedStore?._id === store._id ? null : store)
                }
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{store.Nom}</h3>
                  <p className="text-xs text-slate-600">{store.Login}</p>
                </div>

                <div className="flex justify-center items-center">
                  {store.Status === "Activer" ? (
                    <Wifi size={16} className="text-slate-400 mx-2" title={store.Status} />
                  ) : (
                    <WifiOff size={16} className="text-slate-400 mx-2" title={store.Status} />
                  )}
                </div>

                <div
                  className="p-2"
                  title={getLicenseStatusDisplay(store.Licence)}
                >
                  {store.Licence === "Enable" ? (
                    <ShieldCheck size={16} className="text-green-600" />
                  ) : (
                    <ShieldOff size={16} className="text-red-600" />
                  )}
                </div>
              </div>

              {/* Expandable Details */}
              <AnimatePresence>
                {selectedStore?._id === store._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-slate-50 border-t border-slate-200 px-3 py-3 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-slate-600 text-xs">{t('stores.details.crmId')}</p>
                        <p className="font-medium text-slate-900">{store.idCRM}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 text-xs">{t('stores.details.email')}</p>
                        <p className="font-medium text-slate-900 truncate">{store.Email || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-600 text-xs">{t('stores.details.phone')}</p>
                        <p className="font-medium text-slate-900">{store.Tel || "-"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => {
                          handleViewStore(store);
                          setSelectedStore(null);
                        }}
                        className="flex-1 px-2 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye size={14} />
                        {t('stores.button.view')}
                      </button>
                      <button
                        onClick={() => {
                          openEditModal(store);
                          setSelectedStore(null);
                        }}
                        className="flex-1 px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit size={14} />
                        {t('stores.button.edit')}
                      </button>
                      <button
                        onClick={() => {
                          openDeleteModal(store);
                          setSelectedStore(null);
                        }}
                        className="flex-1 px-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 size={14} />
                        {t('stores.button.delete')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredStores.length === 0 && stores.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="text-center py-12">
            <p className="text-slate-600">{t('stores.empty.noMatch')}</p>
          </Card>
        </motion.div>
      )}

      {!loading && stores.length === 0 && !error && (
        <motion.div variants={itemVariants}>
          <Card className="text-center py-12">
            <p className="text-slate-600">{t('stores.empty.noStores')}</p>
          </Card>
        </motion.div>
      )}

      {/* Add Modal */}
      <AddStoreModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddStore}
      />

      {/* Edit Modal */}
      <EditStoreModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateStore}
        store={selectedStore}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteStore}
        store={selectedStore}
      />
    </motion.div>
  );
}

// Add Store Modal Component
function AddStoreModal({ isOpen, onClose, formData, setFormData, onSubmit }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">{t('stores.modal.title')}</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded" aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder={t('stores.storeNamePlaceholder')}
                value={formData.Nom}
                onChange={(e) => setFormData({ ...formData, Nom: e.target.value })}
                aria-label={t('stores.storeNamePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder={t('stores.loginPlaceholder')}
                value={formData.Login}
                onChange={(e) => setFormData({ ...formData, Login: e.target.value })}
                aria-label={t('stores.loginPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder={t('stores.crmIdPlaceholder')}
                value={formData.idCRM}
                onChange={(e) => setFormData({ ...formData, idCRM: e.target.value })}
                aria-label={t('stores.crmIdPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder={t('stores.passwordPlaceholder')}
                value={formData.Password}
                onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                aria-label={t('stores.passwordPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder={t('stores.emailPlaceholder')}
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                aria-label={t('stores.emailPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder={t('stores.phonePlaceholder')}
                value={formData.Tel}
                onChange={(e) => setFormData({ ...formData, Tel: e.target.value })}
                aria-label={t('stores.phonePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
              >
                {t('stores.modal.cancel')}
              </button>
              <button
                onClick={onSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {t('stores.modal.add')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Edit Store Modal Component
function EditStoreModal({ isOpen, onClose, formData, setFormData, onSubmit, store }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">{t('stores.modal.editTitle')}</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded" aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder={t('stores.storeNamePlaceholder')}
                value={formData.Nom}
                onChange={(e) => setFormData({ ...formData, Nom: e.target.value })}
                aria-label={t('stores.storeNamePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder={t('stores.loginPlaceholder')}
                value={formData.Login}
                onChange={(e) => setFormData({ ...formData, Login: e.target.value })}
                aria-label={t('stores.loginPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder={t('stores.emailPlaceholder')}
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                aria-label={t('stores.emailPlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder={t('stores.phonePlaceholder')}
                value={formData.Tel}
                onChange={(e) => setFormData({ ...formData, Tel: e.target.value })}
                aria-label={t('stores.phonePlaceholder')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-700">Licence</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, Licence: formData.Licence === "Enable" ? "Disable" : "Enable" })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.Licence === "Enable"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.Licence === "Enable" ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
              >
                {t('stores.modal.cancel')}
              </button>
              <button
                type="button"
                onClick={() => onSubmit()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {t('stores.modal.save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Delete Confirm Modal Component
function DeleteConfirmModal({ isOpen, onClose, onConfirm, store }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('stores.modal.deleteTitle')}</h2>
            <p className="text-slate-600 mb-6">
              {t('stores.modal.deleteMessage', { storeName: store?.Nom })}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
              >
                {t('stores.modal.cancel')}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                {t('stores.modal.delete')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ScreenHome;
