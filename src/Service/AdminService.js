
import axios from 'axios';

import { Url } from './CategoriesServer';

const AdminService = {
  
  getAllStores: async () => {
    try {
      const response = await axios.get(`${Url}/auth/all`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch stores");
    }
  },

  AjoutStores: async (data) => {
    try {
      const response = await axios.post(`${Url}/auth/signup`, {
        Nom: data.Nom,
        Login: data.Login,
        Password: data.Password,
        Tel: data.Tel || "",
        idCRM: data.idCRM,
        Email: data.Email || "",
        Setting: false,
        BaseName: "DefaultBase"
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to add store");
    }
  },

  UpdateLicence: async (idCRM, action) => {
    try {
      const response = await axios.get(`${Url}/update-license/${idCRM}/${action}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to update license");
    }
  },

  UpdateStore: async (_id, Nom, Login, Password, idCRM, Email, Tel, Setting) => {
    try {
      const response = await axios.put(`${Url}/auth/modifyUser/${_id}`, {
        Nom,
        Login,
        Password,
        idCRM,
        Email,
        Tel,
        Setting
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to update store");
    }
  },

  getUserByIDcrm: async (idCRM) => {
    try {
      const response = await axios.get(`${Url}/auth/getUserByIdcrm/${idCRM}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to fetch user");
    }
  },

  DeleteUsers: async (_id) => {
    try {
      const response = await axios.delete(`${Url}/auth/deleteUser/${_id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to delete store");
    }
  }
};

export default AdminService;
