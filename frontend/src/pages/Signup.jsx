import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Target,
  Sun,
  Moon,
  Briefcase,
} from "lucide-react";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import "./Signup.css";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !department || !password || !confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        showToast(error.message, "error");
        setLoading(false);
        return;
      }

      const user = data.user;

      if (!user) {
        showToast("User creation failed. Please try again.", "error");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: fullName,
          email: email,
          role: "employee",
          department: department,
          approval_status: "pending",
        },
      ]);

      if (insertError) {
        showToast(insertError.message, "error");
        setLoading(false);
        return;
      }

      showToast("Account created! Awaiting approval. ðŸŽ‰", "success");

      setFullName("");
      setEmail("");
      setDepartment("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      console.error("Signup error:", err);
      showToast("Something went wrong. Please try again.", "error");
    }

    setLoading(false);
  };

  return (
    <main className="signup-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>
      <div className="grid-bg"></div>

      <header className="signup-header">
        <div className="brand">
          <div className="brand-icon">
            <Target size={20} />
          </div>
          <span>Goal Tracking Portal</span>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <section className="signup-center">
        <div className="signup-card-glow"></div>

        <div className="signup-card">
          <div className="signup-title">
            <h1>Create Account</h1>
            <p>Start tracking goals with your team.</p>
          </div>

          <form onSubmit={handleSignup} className="signup-form">
            {/* Full Name */}
            <div className="form-group">
              <div className="input-box">
                <span className="input-icon">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <div className="input-box">
                <span className="input-icon">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Department */}
<div className="input-box">
  <Briefcase size={18} />

  <select
    value={department}
    onChange={(e) => setDepartment(e.target.value)}
  >
    <option value="">Select Department</option>
    <option value="IT">IT</option>
    <option value="CSE">CSE</option>
    <option value="HR">HR</option>
    <option value="Finance">Finance</option>
    <option value="Marketing">Marketing</option>
  </select>
</div>



            {/* Password */}
            <div className="form-group">
              <div className="input-box">
                <span className="input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <div className="input-box">
                <span className="input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Creating..." : "CREATE ACCOUNT"}
            </button>

            <p className="login-text">
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/")}>
                Login
              </button>
            </p>
          </form>

          <div className="divider">
            <span></span>
            <p>Or continue with</p>
            <span></span>
          </div>

          <div className="social-row">
            <button
              type="button"
              onClick={() => showToast("Google OAuth coming soon", "warning")}
            >
              <FaGoogle />
            </button>

            <button
              type="button"
              onClick={() => showToast("Apple OAuth coming soon", "warning")}
            >
              <FaApple />
            </button>

            <button
              type="button"
              onClick={() => showToast("Facebook OAuth coming soon", "warning")}
            >
              <FaFacebookF />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Signup;

