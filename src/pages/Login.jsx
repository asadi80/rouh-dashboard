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

  // if (!loading && user) {
  //   if (user.must_change_password) {
  //     return <Navigate to="/change-password" replace />;
  //   }

  //   return <Navigate to="/" replace />;
  // }

 const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("LOGIN BUTTON CLICKED");
  console.log("Email:", email);

  setError("");
  setSubmitting(true);

  try {
    console.log("Calling signIn...");

    const loggedInUser = await signIn(email, password);

    console.log("LOGIN SUCCESS:", loggedInUser);
    console.log(
      "must_change_password:",
      loggedInUser?.must_change_password
    );

    if (loggedInUser?.must_change_password === true) {
      console.log("REDIRECTING TO CHANGE PASSWORD");
      navigate("/change-password", { replace: true });
    } else {
      console.log("REDIRECTING TO DASHBOARD");
      navigate("/", { replace: true });
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    console.error("LOGIN ERROR MESSAGE:", err?.message);

    setError(
      err.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة."
    );
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

        <button
          className="btn btn-primary admin-login__submit"
          disabled={submitting}
        >
          {submitting ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
