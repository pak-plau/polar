import { Route, Routes, useLocation } from "react-router-dom";
import "./stylesheets/App.css";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/login/Login";
import Home from "./components/home/Home";
import Registration from "./components/registration/Registration";
import Records from "./components/records/Records";
import Employment from "./components/employment/Employment";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";

function App() {
  const location = useLocation();
  const hideNavPaths = ["/"];
  return (
    <AuthProvider>
      {!hideNavPaths.includes(location.pathname) && <Dashboard />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/registration" element={<ProtectedRoute><Registration /></ProtectedRoute>} />
        <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
        <Route path="/employment" element={<ProtectedRoute><Employment /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
