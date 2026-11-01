import { useEffect, useState } from "react";
import { api } from "../lib/api";

const emptyForm = {
  name: "",
  description: "",
};

export default function SpecialtiesManage() {
  const [specialties, setSpecialties] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.get("/api/specialties");
      setSpecialties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "تعذر تحميل التخصصات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("يرجى إدخال اسم التخصص");
      return;
    }

    setCreating(true);
    setError("");

    try {
      await api.post("/api/specialties", {
        name,
        description: form.description.trim() || null,
      });

      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message || "تعذرت إضافة التخصص");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (specialty) => {
    const doctorCount = Number(specialty.doctor_count || 0);

    if (doctorCount > 0) {
      setError(
        `لا يمكن حذف تخصص "${specialty.name}" لأنه مرتبط بـ ${doctorCount} طبيب.`
      );
      return;
    }

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف تخصص "${specialty.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
    );

    if (!confirmed) return;

    setDeletingId(specialty.id);
    setError("");

    try {
      await api.del(`/api/specialties/${specialty.id}`);
      await load();
    } catch (err) {
      setError(err.message || "تعذر حذف التخصص");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (specialty) => {
    setError("");

    try {
      await api.put(`/api/specialties/${specialty.id}`, {
        is_active: !specialty.is_active,
      });

      await load();
    } catch (err) {
      setError(err.message || "تعذر تحديث حالة التخصص");
    }
  };

  return (
    <div>
      <div className="admin-page-head">
        <h1>إدارة التخصصات</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Add specialty */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>
          إضافة تخصص جديد
        </h3>

        <form className="admin-form" onSubmit={handleCreate}>
          <label>
            اسم التخصص
            <input
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              placeholder="مثال: الطب النفسي"
              required
            />
          </label>

          <label>
            الوصف
            <input
              value={form.description}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              placeholder="وصف اختياري للتخصص"
            />
          </label>

          <div className="admin-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? "جارٍ الإضافة..." : "إضافة التخصص"}
            </button>
          </div>
        </form>
      </div>

      {/* Specialties table */}
      <div className="admin-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ fontSize: 16, margin: 0 }}>
            قائمة التخصصات
          </h3>

          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            إجمالي التخصصات: {specialties.length}
          </span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>اسم التخصص</th>
              <th>الوصف</th>
              <th>عدد الأطباء</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr className="admin-empty-row">
                <td colSpan={5}>جارٍ تحميل التخصصات...</td>
              </tr>
            ) : specialties.length === 0 ? (
              <tr className="admin-empty-row">
                <td colSpan={5}>لا توجد تخصصات حتى الآن</td>
              </tr>
            ) : (
              specialties.map((specialty) => (
                <tr key={specialty.id}>
                  <td>
                    <strong>{specialty.name}</strong>
                  </td>

                  <td>
                    {specialty.description || "—"}
                  </td>

                  <td>
                    {specialty.doctor_count ?? 0}
                  </td>

                  <td>
                    <select
                      value={specialty.is_active ? "1" : "0"}
                      onChange={() => handleToggleStatus(specialty)}
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

                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleDelete(specialty)}
                      disabled={
                        deletingId === specialty.id ||
                        Number(specialty.doctor_count || 0) > 0
                      }
                      title={
                        Number(specialty.doctor_count || 0) > 0
                          ? "هذا التخصص مرتبط بأطباء"
                          : "حذف التخصص"
                      }
                      style={{
                        color: "#c0392b",
                      }}
                    >
                      {deletingId === specialty.id
                        ? "جارٍ الحذف..."
                        : "حذف"}
                    </button>
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