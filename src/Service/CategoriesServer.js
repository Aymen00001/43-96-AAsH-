// Client-side (CategoriesServer.js)
import axios from 'axios';

 export const  Url = import.meta.env.VITE_API_URL || 'http://localhost:8002'



const CategoriesServer = {
  
    addCategory: async (formData) => {
   //     console.log(formData);
      try {
        const response = await axios.post(`${Url}/categories/AddCat`, formData); 
//console.log(";;",response.data);
     return response.data;
      } catch (error) {
        throw error.response.data.error; 
      }
    },

    getAllCategory: async () => {
    
    try {
      const response = await axios.get(`${Url}/categories/AllCat`); 
    
      return response.data;
    } catch (error) {
      throw error.response.data.error; 
    }


  },
  deleteCategory: async (categoryId,name) => {
    try {
      const response = await axios.delete(`${Url}/categories/DeleteCat/${categoryId}/${name}`);
//console.log(response);
      if (response.status === 200) {
    //    console.log("Category deleted successfully");
        return true
      } else {
     //   console.log("Failed to delete category");
        return false
      }
    } catch (error) {
      throw error.response.data.error;
    }
  },



  };

export default CategoriesServer;
