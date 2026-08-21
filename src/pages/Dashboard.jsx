import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/dashboard/summary")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <div className="admin-page-head">
        <h1>نظرة عامة</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-stats">
        <div className="admin-stat">
          <strong>{data ? data.doctors : "…"}</strong>
          <span>عدد الأطباء</span>
        </div>
        <div className="admin-stat">
          <strong>{data ? data.staff : "…"}</strong>
          <span>عدد الموظفين</span>
        </div>
        <div className="admin-stat">
          <strong>{data ? data.requests : "…"}</strong>
          <span>طلبات حجز جديدة</span>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginBottom: 14, fontSize: 16 }}>أحدث طلبات الحجز</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>اليوم المفضل</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {!data || data.recentRequests.length === 0 ? (
              <tr className="admin-empty-row">
                <td colSpan={4}>لا توجد طلبات بعد</td>
              </tr>
            ) : (
              data.recentRequests.map((r) => (
                <tr key={r.id}>
                  <td>{r.patient_name}</td>
                  <td className="ltr">{r.patient_phone}</td>
                  <td>{r.preferred_day || "—"}</td>
                  <td>
                    <span className="admin-badge admin-badge--active">{r.status}</span>
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
