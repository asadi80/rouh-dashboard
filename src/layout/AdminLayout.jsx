import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  // Close the drawer on route change
  useEffect(() => {
      console.log("AdminLayout v2 loaded");

    setMenuOpen(false);
  }, [location.pathname]);

  // Escape to close + lock body scroll while open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      {/* Mobile top bar (hidden on desktop) */}
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-topbar__toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
        >
          <span className="admin-topbar__title">لوحة تحكم مصحة روح</span>
          <span
            className={"admin-burger" + (menuOpen ? " admin-burger--open" : "")}
          >
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      <div
        className={
          "admin-overlay" + (menuOpen ? " admin-overlay--visible" : "")
        }
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        id="admin-sidebar"
        className={"admin-sidebar" + (menuOpen ? " admin-sidebar--open" : "")}
      >
        <div className="admin-sidebar__brand">لوحة تحكم مصحة روح</div>
        <nav className="admin-sidebar__nav">
          {links
            .filter((l) => !l.superOnly || isSuperAdmin)
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  "admin-sidebar__link" +
                  (isActive ? " admin-sidebar__link--active" : "")
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
