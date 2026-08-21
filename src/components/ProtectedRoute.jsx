import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// requireRole: "admin" (admin أو super_admin) أو "super_admin" (فقط)
export default function ProtectedRoute({ children, requireRole = "admin" }) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    return <div className="admin-loading">جارٍ التحقق من الدخول...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = requireRole === "super_admin" ? isSuperAdmin : isAdmin;
  if (!allowed) {
    return <div className="admin-loading">لا تملك صلاحية الوصول لهذه الصفحة.</div>;
  }

  return children;
}
