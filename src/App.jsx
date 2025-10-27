import React, { useState } from "react";
import { Header } from "./components/Header/Header";
import { SideBar } from "./components/SideBar/SideBar";
import { ContentArea } from "./components/ContentArea/ContentArea";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Ads } from "./pages/Ads/Ads";
import { Orders } from "./pages/Orders/Orders";
import { Users } from "./pages/Users/Users";
import { Support } from "./pages/Support/Support";
import { Alerts } from "./pages/Alerts/Alerts";
import { Categories } from "./pages/Categories/Categories";
import { Applcations } from "./pages/Applications/Applications";
import { Settings } from "./pages/Settings/Settings";
import { Login } from "./pages/Login/Login";
import { Locations } from "./pages/Locations/Locations";

function App() {
  const [openSideBar, setOpenSideBar] = useState(false);
  const [loggedin, setLoggedin] = useState(false);
  return (
    <BrowserRouter>
      {!loggedin ? (
        <Login setLoggedin={setLoggedin} />
      ) : (
        <>
          <Header setOpenSideBar={setOpenSideBar} />
          <SideBar
            openSideBar={openSideBar}
            setOpenSideBar={setOpenSideBar}
            setLoggedin={setLoggedin}
          />

          <ContentArea>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ads" element={<Ads />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/users" element={<Users />} />
              <Route path="/support" element={<Support />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/applications" element={<Applcations />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ContentArea>
        </>
      )}
    </BrowserRouter>
  );
}

export default App;
