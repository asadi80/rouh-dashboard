import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AdminLayout.css";

const links = [
  { to: "/", label: "نظرة عامة", end: true },
  { to: "/settings", label: "إعدادات العيادة" },
  { to: "/doctors", label: "الأطباء" },
  { to: "/services", label: "الخدمات" },
  { to: "/why-us", label: "لماذا نحن" },
  { to: "/hours", label: "أوقات العمل" },
  { to: "/announcements", label: "الإعلانات" },
  { to: "/job-titles", label: "المسميات الوظيفية" },
  { to: "/staff", label: "الموظفون", superOnly: true },
];

export default function AdminLayout() {
  const { user, signOut, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">لوحة تحكم مصحة روح</div>
        <nav className="admin-sidebar__nav">
          {links
            .filter((l) => !l.superOnly || isSuperAdmin)
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  "admin-sidebar__link" + (isActive ? " admin-sidebar__link--active" : "")
                }
              >
                {l.label}
              </NavLink>
            ))}
        </nav>

        <div className="admin-sidebar__user">
          <div>
            <strong>{user?.full_name}</strong>
            <span>{user?.role === "super_admin" ? "مدير عام" : "مدير"}</span>
          </div>
          <button onClick={handleSignOut} className="admin-sidebar__logout">
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
