import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import "./Login.css";

export default function ChangePassword() {
  const { user, loading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && user && !user.must_change_password) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور الجديدتان غير متطابقتين.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/api/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess("تم تغيير كلمة المرور بنجاح.");

      // Refresh user so must_change_password becomes false
      if (refreshUser) {
        await refreshUser();
      }

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 800);
    } catch (err) {
      setError(err.message || "تعذر تغيير كلمة المرور.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h1>تغيير كلمة المرور</h1>

        <p>
          يجب تغيير كلمة المرور المؤقتة قبل الدخول إلى لوحة التحكم.
        </p>

        {error && <div className="admin-error">{error}</div>}

        {success && (
          <div className="admin-success">
            {success}
          </div>
        )}

        <label>
          كلمة المرور الحالية
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <label>
          كلمة المرور الجديدة
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8 أحرف على الأقل"
          />
        </label>

        <label>
          تأكيد كلمة المرور الجديدة
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أعد كتابة كلمة المرور"
          />
        </label>

        <button
          type="submit"
          className="btn btn-primary admin-login__submit"
          disabled={submitting}
        >
          {submitting ? "جارٍ تغيير كلمة المرور..." : "تغيير كلمة المرور"}
        </button>
      </form>
    </div>
  );
}

