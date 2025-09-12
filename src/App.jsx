import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyClubs from "./pages/MyClubs";
import Applications from "./pages/Applications";
import Attendance from "./pages/Attendance";
import Students from "./pages/Students";
import Profile from "./pages/Profile";

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-clubs" element={<MyClubs />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/students" element={<Students />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
