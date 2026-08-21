import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h1>لوحة تحكم مصحة روح</h1>
        <p>سجّل الدخول بحساب الموظف الخاص بك</p>

        {error && <div className="admin-error">{error}</div>}

        <label>
          البريد الإلكتروني
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@rouh.ly"
          />
        </label>

        <label>
          كلمة المرور
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button className="btn btn-primary admin-login__submit" disabled={submitting}>
          {submitting ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
