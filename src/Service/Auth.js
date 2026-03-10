// Client-side (AuthService.js)
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import { Url } from './CategoriesServer';

const AuthService= {
  
    signIn: async (login, password) => {
        try {
          const response = await axios.post(`${Url}/auth/signin`, { Login: login, Password: password });
          
          // Store token and user info in cookies from nested data object
          if (response.data.data && response.data.data.access_token) {
            const token = response.data.data.access_token;
            const decoded = jwtDecode(token);
            
            // Store the token
            Cookies.set('access_token', token);
            
            // Store user info from response
            if (response.data.data.Nom) Cookies.set('Name', response.data.data.Nom);
            if (response.data.data.Setting !== undefined) Cookies.set('Setting', String(response.data.data.Setting));
            if (response.data.data.userid) Cookies.set('userid', response.data.data.userid);
            if (response.data.data.idCRM) Cookies.set('idCRM', response.data.data.idCRM);
            
            // IMPORTANT: Store Role from decoded token, not from response
            if (decoded.Role) {
              Cookies.set('Role', decoded.Role);
              console.log(`[AUTH] Role: ${decoded.Role}`);
            } else if (decoded.role) {
              Cookies.set('Role', decoded.role);
              console.log(`[AUTH] Role: ${decoded.role}`);
            }
            
            console.log(`[AUTH] Session established`);
          }
          
          return response.data.data;
        } catch (error) {
          console.error(`[AUTH] Error:`, error);
          throw new Error(error.response?.data?.error || "Authentication failed");
        }
      },

    logout: async () => {
        try {
          Cookies.remove('access_token');
          Cookies.remove('Name');
          Cookies.remove('Role');
          Cookies.remove('Setting');
          Cookies.remove('userid');
          Cookies.remove('idCRM');
          console.log(`[AUTH] Logout complete`);
          return true;
        } catch (error) {
          console.error(error);
        }
      }

  



  };

export default AuthService;
