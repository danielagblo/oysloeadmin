import React from "react";
import styles from "./login.module.css";
import Email from "../../assets/email.png";
import Password from "../../assets/password.png";
import ImageIcon from "../../components/SVGIcons/ImageIcon";

export const Login = ({ setLoggedin }) => {
  const isLoggedIn = sessionStorage?.getItem("isLoggedIn");

  if (JSON.parse(isLoggedIn)) {
    setLoggedin(isLoggedIn);
  }
  const handleLogin = () => {
    sessionStorage?.setItem("isLoggedIn", JSON.stringify(true));
    setLoggedin(true);
  };

  return (
    <div className={styles.loginContainer}>
      <form>
        <h2>Oysloe Admin</h2>
        <div className={styles.inputField}>
          <ImageIcon src={Email} size={25} alt="Email" />
          <input type="email" placeholder="Email Address" required />
        </div>
        <div className={styles.inputField}>
          <ImageIcon src={Password} size={25} alt="Email" />
          <input type="password" placeholder="Password" required />
        </div>
        <button onClick={handleLogin}>Login</button>
      </form>
    </div>
  );
};
