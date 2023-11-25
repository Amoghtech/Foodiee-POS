import { AiOutlineHome } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";
import Home from "../pages/Home";
import Analysis from "../pages/Analysis";
import Billing from "../pages/Billing";
import Profile from "../pages/Profile";
export const routesList = [
  {
    path: "/",
    text: "Home",
    icon: <AiOutlineHome className="w-10 h-10 icon" />,
    component: <Home />,
  },
  {
    path: "/billing",
    text: "Analysis",
    icon: <RiBillLine className="w-10 h-10 icon" />,
    component: <Billing />,
  },
  {
    path: "/analysis",
    text: "Analysis",
    icon: <FiSettings className="w-10 h-10 icon" />,
    component: <Analysis />,
  },
  {
    path: "/profile",
    text: "Profile",
    component: <Profile />,
    onlyRoute: true
  }
];
export const getRandomColors = function getRandomLightColor() {
  const red = Math.floor(Math.random() * 155) + 100; 
  const green = Math.floor(Math.random() * 155) + 100;
  const blue = Math.floor(Math.random() * 155) + 100;
  const color = `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
  return color;
};
