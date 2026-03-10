import Dashboard from "./views/Dashboard";
import ScreenHome from "./views/ScreenHome";
import Logout from "./views/Logout";
import Profil from "./views/Profil";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { BarChart3, Users, Settings, LogOut } from "lucide-react";

const token = Cookies.get("access_token");
const decoded = token ? jwtDecode(token) : "";
const nm = Cookies.get("Name");
const Name = nm ? nm : "Dashboard";
const Setting = Cookies.get("Setting");

console.log("[ROUTES] Loading...");
console.log("[ROUTES] Role:", decoded.Role);
console.log("[ROUTES] Store:", Name);

let routes = [];

if (decoded.Role === "admin") {
  console.log("[ROUTES] Admin mode");
  routes.push(
    {
      path: "/stores",
      name: "Stores",
      icon: <Users size={20} />,
      component: <ScreenHome />,
      layout: "/admin",
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <BarChart3 size={20} />,
      component: <Dashboard />,
      layout: "/admin",
    },
    {
      path: "/logout",
      name: "Logout",
      icon: <LogOut size={20} />,
      component: <Logout />,
      layout: "/admin",
    }
  );
} else if (decoded.Role === "store" && (Setting === "true" || Setting === true)) {
  console.log("[ROUTES] Store mode");
  routes.push(
    {
      path: "/dashboard",
      name: "Statistics",
      icon: <BarChart3 size={20} />,
      component: <Dashboard />,
      layout: "/admin",
    },
    {
      path: "/profile",
      name: "Settings",
      icon: <Settings size={20} />,
      component: <Profil />,
      layout: "/admin",
    },
    {
      path: "/logout",
      name: "Logout",
      icon: <LogOut size={20} />,
      component: <Logout />,
      layout: "/admin",
    }
  );
} else if (decoded.Role === "store" && (Setting === "false" || Setting === false)) {
  console.log("[ROUTES] Store mode (read-only)");
  routes.push(
    {
      path: "/dashboard",
      name: "Statistics",
      icon: <BarChart3 size={20} />,
      component: <Dashboard />,
      layout: "/admin",
    },
    {
      path: "/logout",
      name: "Logout",
      icon: <LogOut size={20} />,
      component: <Logout />,
      layout: "/admin",
    }
  );
} else {
  console.error("[ROUTES] Error: Invalid configuration");
}

console.log("[ROUTES] Ready:", routes.length > 0 ? routes.length + " routes" : "Error");

export default routes;
