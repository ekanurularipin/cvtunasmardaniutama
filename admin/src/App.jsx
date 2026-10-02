import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RtlLayout from "layouts/rtl";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import ProtectedRoute from "components/auth/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* =========================
          AUTH
      ========================== */}
      <Route path="auth/*" element={<AuthLayout />} />

      {/* =========================
          ADMIN - WAJIB LOGIN
      ========================== */}
      <Route
        path="admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* =========================
          RTL
      ========================== */}
      <Route path="rtl/*" element={<RtlLayout />} />

      {/* =========================
          DEFAULT
      ========================== */}
      <Route
        path="/"
        element={<Navigate to="/admin" replace />}
      />
    </Routes>
  );
};

export default App;