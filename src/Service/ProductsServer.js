// Client-side (CategoriesServer.js)
import axios from 'axios';
import { Url } from './CategoriesServer';
const ProductsServer = {
  
 

    getAllNameCategory: async () => {
    
    try {
      const response = await axios.get(`${Url}/product/AllNameCat`);
    //  console.log("Catgeories :",response.data);
      return response.data;
    } catch (error) {
      throw error.response.data.error; 
    }
  },
  getAllProduct: async () => {
    try {
      const response = await axios.get(`${Url}/product/AllProduct`);
    //  console.log("product :",response.data);
      return response.data;
    } catch (error) {
      throw error.response.data.error; 
    }
  },

  addProduct: async (formData) => {
  //  console.log(formData);
  try {
    const response = await axios.post(`${Url}/product/AddProduct`, formData); 
// console.log("Add :",response.data);
 return response.data;
  } catch (error) {
    throw error.response.data.error; 
  }
},
deleteProduct: async (productId,name) => {
  try {
    const response = await axios.delete(`${Url}/product/DeleteProduct/${productId}/${name}`);
//console.log(response);
    if (response.status === 200) {
   //   console.log("Category deleted successfully");
      return true
    } else {
 //     console.log("Failed to delete category");
      return false
    }
  } catch (error) {
    throw error.response.data.error;
  }
},


GetAllProductWithoutCodebar: async () => {
  try {
    const response = await axios.get(`${Url}/product/AllProductWithoutCodebar`);
//console.log("AllProductWithoutCodebar :",response.data);
    return response.data;
  } catch (error) {
    throw error.response.data.error; 
  }
},
AddCodebarToProduct: async (productId,codebar) => {
//  console.log(productId,codebar);
try {
  const response = await axios.post(`${Url}/product/AddCodebarToProduct/${productId}/${codebar}`); 
//console.log("Add :",response.data);
return response.data;
} catch (error) {
  throw error.response.data.error; 
}
},
GetProductWithCodebar: async (codebar) => {
  try {
    const response = await axios.get(`${Url}/product/GetProductWithCode/${codebar}`);
    //console.log("Product With CodeBar ",codebar," is :",response.data);
    return response.data;
  } catch (error) {
    throw error.response.data.error; 
  }
},
  };
  


export default ProductsServer;
