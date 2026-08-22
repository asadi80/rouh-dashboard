import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";

import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";

import Dashboard from "./pages/Dashboard";
import DoctorsManage from "./pages/DoctorsManage";
import ServicesManage from "./pages/ServicesManage";
import WhyUsManage from "./pages/WhyUsManage";
import HoursManage from "./pages/HoursManage";
import AnnouncementsManage from "./pages/AnnouncementsManage";
import JobTitlesManage from "./pages/JobTitlesManage";
import StaffManage from "./pages/StaffManage";
import SettingsManage from "./pages/SettingsManage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Password change page */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="doctors" element={<DoctorsManage />} />
            <Route path="services" element={<ServicesManage />} />
            <Route path="why-us" element={<WhyUsManage />} />
            <Route path="hours" element={<HoursManage />} />
            <Route path="announcements" element={<AnnouncementsManage />} />
            <Route path="job-titles" element={<JobTitlesManage />} />
            <Route path="settings" element={<SettingsManage />} />

            <Route
              path="staff"
              element={
                <ProtectedRoute requireRole="super_admin">
                  <StaffManage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}