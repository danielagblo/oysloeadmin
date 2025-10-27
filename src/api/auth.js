export const handleLogin = (setLoggedin) => {
  sessionStorage?.setItem("isLoggedIn", JSON.stringify(true));
  setLoggedin(true);
};

export const handleLogout = (setLoggedin) => {
  sessionStorage?.setItem("isLoggedIn", JSON.stringify(false));
  setLoggedin(false);
};
