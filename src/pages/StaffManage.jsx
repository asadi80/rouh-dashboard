import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const roleLabels = {
  super_admin: "مدير عام (صلاحية كاملة)",
  admin: "مدير محتوى",
  doctor: "طبيب",
  staff: "موظف استقبال",
};

const emptyNewStaff = { full_name: "", email: "", password: "", role: "staff", job_title: "" };

export default function StaffManage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStaff, setNewStaff] = useState(emptyNewStaff);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [staffRes, titlesRes] = await Promise.all([
        api.get("/api/staff"),
        api.get("/api/job-titles"),
      ]);
      setProfiles(staffRes);
      setJobTitles(titlesRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = async (id, field, value) => {
    setProfiles((ps) => ps.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    try {
      await api.put(`/api/staff/${id}`, { [field]: value });
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await api.post("/api/staff", newStaff);
      setNewStaff(emptyNewStaff);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="admin-page-head">
        <h1>الموظفون والصلاحيات</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>إضافة موظف جديد</h3>
        <form className="admin-form" onSubmit={handleCreate}>
          <label>
            الاسم الكامل
            <input
              value={newStaff.full_name}
              onChange={(e) => setNewStaff((s) => ({ ...s, full_name: e.target.value }))}
              required
            />
          </label>
          <label>
            البريد الإلكتروني
            <input
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </label>
          <label>
            كلمة المرور المؤقتة
            <input
              type="text"
              minLength={8}
              value={newStaff.password}
              onChange={(e) => setNewStaff((s) => ({ ...s, password: e.target.value }))}
              placeholder="8 أحرف على الأقل"
              required
            />
          </label>
          <label>
            الدور
            <select
              value={newStaff.role}
              onChange={(e) => setNewStaff((s) => ({ ...s, role: e.target.value }))}
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-form--full">
            المسمى الوظيفي
            <select
              value={newStaff.job_title}
              onChange={(e) => setNewStaff((s) => ({ ...s, job_title: e.target.value }))}
            >
              <option value="">— بدون —</option>
              {jobTitles.map((t) => (
                <option key={t.id} value={t.title_ar}>
                  {t.title_ar}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-actions">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "جارٍ الإضافة..." : "إضافة الموظف"}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>البريد</th>
              <th>الدور</th>
              <th>المسمى الوظيفي</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="admin-empty-row">
                <td colSpan={5}>جارٍ التحميل...</td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td className="ltr">{p.email}</td>
                  <td>
                    <select
                      value={p.role}
                      disabled={p.id === user?.id}
                      onChange={(e) => updateField(p.id, "role", e.target.value)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1.5px solid var(--line)",
                        fontFamily: "inherit",
                        fontSize: 13,
                      }}
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={p.job_title ?? ""}
                      onChange={(e) => updateField(p.id, "job_title", e.target.value)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1.5px solid var(--line)",
                        fontFamily: "inherit",
                        fontSize: 13,
                      }}
                    >
                      <option value="">— بدون —</option>
                      {jobTitles.map((t) => (
                        <option key={t.id} value={t.title_ar}>
                          {t.title_ar}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={p.is_active ? "1" : "0"}
                      disabled={p.id === user?.id}
                      onChange={(e) => updateField(p.id, "is_active", e.target.value === "1")}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1.5px solid var(--line)",
                        fontFamily: "inherit",
                        fontSize: 13,
                      }}
                    >
                      <option value="1">مفعّل</option>
                      <option value="0">موقوف</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
