import React from "react";
import styles from "./sidebar.module.css";
import { Categories } from "../SVGIcons/Categories";
import { Support } from "../SVGIcons/Support";
import { Logout } from "../SVGIcons/Logout";
import { Dashboard } from "../SVGIcons/Dashboard";
import { Settings } from "../SVGIcons/Settings";
import Ads from "../../assets/Ads.png";
import Alerts from "../../assets/Alerts.png";
import Applications from "../../assets/Applications.png";
import Order from "../../assets/Order.png";
import Users from "../../assets/Users.png";
import ImageIcon from "../SVGIcons/ImageIcon";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { Location } from "../SVGIcons/Location";
import { handleLogout } from "../../api/auth";

export const SideBar = ({ openSideBar, setOpenSideBar, setLoggedin }) => {
  const links = [
    {
      page: "Dashboard",
      link: "/",
      icon: () => <Dashboard size={25} />,
    },
    {
      page: "Ads",
      link: "/ads",
      icon: () => <ImageIcon src={Ads} size={25} alt="Ads Icon" />,
    },
    {
      page: "Orders",
      link: "/orders",
      icon: () => <ImageIcon src={Order} size={25} alt="Ads Icon" />,
    },
    {
      page: "Users",
      link: "/users",
      icon: () => <ImageIcon src={Users} size={25} alt="Ads Icon" />,
    },
    {
      page: "Support",
      link: "/support",
      icon: () => <Support size={25} />,
    },
    {
      page: "Alerts",
      link: "/alerts",
      icon: () => <ImageIcon src={Alerts} size={25} alt="Ads Icon" />,
    },
    {
      page: "Categories",
      link: "/categories",
      icon: () => <Categories size={30} />,
    },
    {
      page: "Applicatons",
      link: "/applications",
      icon: () => <ImageIcon src={Applications} size={25} alt="Ads Icon" />,
    },
    {
      page: "Locations",
      link: "/locations",
      icon: () => <Location size={25} />,
    },
  ];

  return (
    <div
      className={`${styles.sidebarContainer} ${
        openSideBar ? styles.open : styles.close
      }`}
    >
      <div className={styles.links}>
        <button
          className={styles.menuButtonIcon}
          onClick={() => setOpenSideBar((prev) => !prev)}
        >
          <X size={30} />
        </button>
        {links?.map((link, i) => (
          <NavLink
            key={i}
            to={link?.link}
            className={({ isActive }) =>
              isActive ? styles.active : styles.link
            }
          >
            {link?.icon()}
            <p>{link?.page}</p>
          </NavLink>
        ))}
      </div>
      <div className={styles.logset}>
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <Settings size={25} />
          <p>Settings</p>
        </NavLink>
        <button
          className={styles.link}
          onClick={() => handleLogout(setLoggedin)}
        >
          <Logout size={25} />
          <p>Logout</p>
        </button>
      </div>
    </div>
  );
};
