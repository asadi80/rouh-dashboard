import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function JobTitlesManage() {
  const [titles, setTitles] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [editing, setEditing] = useState(null); // { id, title_ar }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setTitles(await api.get("/api/job-titles"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/api/job-titles", { title_ar: newTitle.trim() });
      setNewTitle("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing?.title_ar.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.put(`/api/job-titles/${editing.id}`, { title_ar: editing.title_ar.trim() });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف هذا المسمى الوظيفي؟")) return;
    await api.del(`/api/job-titles/${id}`);
    load();
  };

  return (
    <div>
      <div className="admin-page-head">
        <h1>المسميات الوظيفية</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>إضافة مسمى وظيفي جديد</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10 }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="مثال: استشاري الطب النفسي للنساء"
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid var(--line)",
              fontFamily: "inherit",
              fontSize: 14,
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            إضافة
          </button>
        </form>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>المسمى الوظيفي</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="admin-empty-row">
                <td colSpan={2}>جارٍ التحميل...</td>
              </tr>
            ) : titles.length === 0 ? (
              <tr className="admin-empty-row">
                <td colSpan={2}>لا توجد مسميات بعد</td>
              </tr>
            ) : (
              titles.map((t) => (
                <tr key={t.id}>
                  <td>
                    {editing?.id === t.id ? (
                      <form onSubmit={handleUpdate} style={{ display: "flex", gap: 8 }}>
                        <input
                          value={editing.title_ar}
                          onChange={(e) => setEditing((s) => ({ ...s, title_ar: e.target.value }))}
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1.5px solid var(--line)",
                            fontFamily: "inherit",
                            fontSize: 13.5,
                          }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                          حفظ
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                          إلغاء
                        </button>
                      </form>
                    ) : (
                      t.title_ar
                    )}
                  </td>
                  <td>
                    {editing?.id !== t.id && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-ghost" onClick={() => setEditing(t)}>
                          تعديل
                        </button>
                        <button className="btn btn-ghost" onClick={() => handleDelete(t.id)}>
                          حذف
                        </button>
                      </div>
                    )}
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
