import { Route, Routes, useLocation } from "react-router-dom"
import './stylesheets/App.css';
import Dashboard from "./components/dashboard/Dashboard"
import Login from "./components/login/Login";
import Home from "./components/home/Home";
import Registration from "./components/registration/Registration"
import Records from "./components/records/Records"
import Employment from "./components/employment/Employment"

function App() {
  const location = useLocation();
  const hideNavPaths = ["/"];
  return (
    <>
      {!hideNavPaths.includes(location.pathname) && <Dashboard />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/records" element={<Records />} />
        <Route path="/employment" element={<Employment />} />
      </Routes>
    </>
  );
}

export default App;
