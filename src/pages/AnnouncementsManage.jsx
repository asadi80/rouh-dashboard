import { useEffect, useState } from "react";
import { api } from "../lib/api";

const emptyForm = { id: null, title: "", message: "", is_active: true };

export default function AnnouncementsManage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.get("/api/announcements/admin"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { title: form.title || null, message: form.message, is_active: form.is_active };
    try {
      if (form.id) await api.put(`/api/announcements/${form.id}`, payload);
      else await api.post("/api/announcements", payload);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await api.put(`/api/announcements/${item.id}`, {
        title: item.title,
        message: item.message,
        is_active: !item.is_active,
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف هذا الإعلان؟")) return;
    await api.del(`/api/announcements/${id}`);
    load();
  };

  return (
    <div>
      <div className="admin-page-head">
        <h1>الإعلانات</h1>
      </div>

      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 18, lineHeight: 1.9 }}>
        يظهر الإعلان في الموقع العام فقط إذا كان مفعّلًا. إن لم يوجد أي إعلان مفعّل، لا يظهر أي شريط
        إعلانات على الموقع إطلاقًا.
      </p>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>
          {form.id ? "تعديل إعلان" : "إضافة إعلان جديد"}
        </h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-form--full">
            العنوان (اختياري)
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: إجازة العيد"
            />
          </label>
          <label className="admin-form--full">
            نص الإعلان
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
            />
          </label>
          <label>
            الحالة
            <select
              value={form.is_active ? "1" : "0"}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "1" }))}
            >
              <option value="1">مفعّل (يظهر في الموقع)</option>
              <option value="0">غير مفعّل (مخفي)</option>
            </select>
          </label>
          <div className="admin-actions">
            {form.id && (
              <button type="button" className="btn btn-ghost" onClick={() => setForm(emptyForm)}>
                إلغاء
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "جارٍ الحفظ..." : form.id ? "حفظ" : "إضافة"}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>النص</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="admin-empty-row">
                <td colSpan={4}>جارٍ التحميل...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr className="admin-empty-row">
                <td colSpan={4}>لا توجد إعلانات بعد</td>
              </tr>
            ) : (
              items.map((a) => (
                <tr key={a.id}>
                  <td>{a.title || "—"}</td>
                  <td style={{ maxWidth: 320 }}>{a.message}</td>
                  <td>
                    <button
                      className={`admin-badge ${
                        a.is_active ? "admin-badge--active" : "admin-badge--inactive"
                      }`}
                      style={{ border: "none", cursor: "pointer" }}
                      onClick={() => handleToggle(a)}
                    >
                      {a.is_active ? "مفعّل" : "مخفي"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost" onClick={() => setForm(a)}>
                        تعديل
                      </button>
                      <button className="btn btn-ghost" onClick={() => handleDelete(a.id)}>
                        حذف
                      </button>
                    </div>
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
