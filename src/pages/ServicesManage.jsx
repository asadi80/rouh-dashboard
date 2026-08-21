import { useEffect, useState } from "react";
import { api } from "../lib/api";

const emptyForm = { id: null, icon: "🧠", title: "", description: "" };

export default function ServicesManage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api.get("/api/services"));
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
    const payload = { icon: form.icon, title: form.title, description: form.description };
    try {
      if (form.id) await api.put(`/api/services/${form.id}`, payload);
      else await api.post("/api/services", payload);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف هذه الخدمة؟")) return;
    await api.del(`/api/services/${id}`);
    load();
  };

  return (
    <div>
      <div className="admin-page-head">
        <h1>إدارة الخدمات</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>
          {form.id ? "تعديل خدمة" : "إضافة خدمة جديدة"}
        </h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            الأيقونة (إيموجي)
            <input
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              required
            />
          </label>
          <label>
            العنوان
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
          <label className="admin-form--full">
            الوصف
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
            />
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
              <th></th>
              <th>العنوان</th>
              <th>الوصف</th>
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
                <td colSpan={4}>لا توجد خدمات بعد</td>
              </tr>
            ) : (
              items.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontSize: 20 }}>{s.icon}</td>
                  <td>{s.title}</td>
                  <td style={{ maxWidth: 340 }}>{s.description}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost" onClick={() => setForm(s)}>
                        تعديل
                      </button>
                      <button className="btn btn-ghost" onClick={() => handleDelete(s.id)}>
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
