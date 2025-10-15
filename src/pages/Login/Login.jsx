import React from "react";
import styles from "./login.module.css";
import Email from "../../assets/email.png";
import Password from "../../assets/password.png";
import ImageIcon from "../../components/SVGIcons/ImageIcon";

export const Login = () => {
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
        <button>Login</button>
      </form>
    </div>
  );
};
