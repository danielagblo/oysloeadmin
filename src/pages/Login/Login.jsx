import React from "react";
import styles from "./login.module.css";
import Email from "../../assets/email.png";
import Password from "../../assets/password.png";
import ImageIcon from "../../components/SVGIcons/ImageIcon";
import { handleLogin } from "../../api/auth";

export const Login = ({ setLoggedin }) => {
  const isLoggedIn = sessionStorage?.getItem("isLoggedIn");

  if (JSON.parse(isLoggedIn)) {
    setLoggedin(isLoggedIn);
  }

  return (
    <div className={styles.loginContainer}>
      <form>
        <h2>Oysloe Admin</h2>
        <div className={styles.inputField}>
          <ImageIcon src={Email} size={1.5} alt="Email" />
          <input type="email" placeholder="Email Address" required />
        </div>
        <div className={styles.inputField}>
          <ImageIcon src={Password} size={1.5} alt="Email" />
          <input type="password" placeholder="Password" required />
        </div>
        <button onClick={() => handleLogin(setLoggedin)}>Login</button>
      </form>
    </div>
  );
};
