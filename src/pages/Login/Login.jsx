import React, { useState, useEffect } from "react";
import styles from "./login.module.css";
import Users from "../../assets/Users.png";
import Password from "../../assets/password.png";
import ImageIcon from "../../components/SVGIcons/ImageIcon";
import { handleLogin } from "../../api/auth";

export const Login = ({ setLoggedin, setAdmin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const isLoggedIn = sessionStorage?.getItem("isLoggedIn");
      if (isLoggedIn && JSON.parse(isLoggedIn) === true) {
        setLoggedin(true);
      }
    } catch (e) {}
  }, [setLoggedin]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { admin } = await handleLogin(
        username.trim(),
        password,
        setLoggedin
      );
      if (setAdmin) setAdmin(admin); // store admin info in parent
    } catch (err) {
      setError(err?.message || "Login failed");
      console.log("Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={onSubmit}>
        <h2>Oysloe Admin</h2>
        <div className={styles.inputField}>
          <ImageIcon src={Users} size={1.5} alt="User" />
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            autoComplete="username"
          />
        </div>
        <div className={styles.inputField}>
          <ImageIcon src={Password} size={1.5} alt="Password" />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};
