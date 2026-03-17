import axios from 'axios';
import { Url } from './CategoriesServer';

const UserService = {
  GetStatFromTableReel: async (idCRM, date1, date2) => {
    try {
   
      const response = await axios.get(`${Url}/get-detailed-sales-summary`, {
        params: {
          idCRM: idCRM,
          date1: date1,
          date2: date2
        }
      });
     
      return response.data;
    } catch (error) {
      throw error.response.data.error;
    }
  },
  GetStatFromTableStats: async (idCRM, date1, date2) => {
    try {
      // Append query parameters to the URL string
      const response = await axios.get(`${Url}/get-sales-summary`, {
        params: {
          idCRM: idCRM,
          date1: date1,
          date2: date2
        }
      });
     
      return response.data;
    } catch (error) {
      throw error.response.data.error;
    }
  },
  GetBaseDeDonne: async (idCRM) => {
    try {
    
const response = await axios.get(`${Url}/get-store-name/${idCRM}`);
      return response.data;
    } catch (error) {
      throw error.response.data.error;
    }
  },
  UpdateBaseDeDonne: async (idCRM,action) => {
    try {
      console.log(idCRM,action)
      const response = await axios.get(`${Url}/update-database/${idCRM}/${action}`);

      return response.data;
    } catch (error) {
      throw error.response.data.error;
    }
  },

  GetTickets: async ({idCRM, date1, date2, search, paymentMethod, fulfillmentMode, page = 1, limit = 50}) => {
    try {
      const response = await axios.get(`${Url}/get-tickets`, {
        params: {
          idCRM,
          date1,
          date2,
          search,
          paymentMethod,
          fulfillmentMode,
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      // if backend returned structured error
      if (error.response && error.response.data) {
        throw error.response.data.error || error.message;
      }
      throw error;
    }
  }

};

export default UserService;
