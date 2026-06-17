import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Target,
  Sun,
  Moon,
} from "lucide-react";
import {
  FaGoogle,
  FaFacebookF,
  FaApple,
} from "react-icons/fa";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  function showToast(message, type = "success") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showToast(error.message, "error");
      return;
    }

    const user = data.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      showToast(profileError.message, "error");
      await supabase.auth.signOut();
      return;
    }

    if (profile.approval_status === "pending") {
      showToast("Your account is awaiting approval.", "warning");
      await supabase.auth.signOut();
      return;
    }

    if (profile.approval_status === "rejected") {
      showToast("Your account has been rejected.", "error");
      await supabase.auth.signOut();
      return;
    }

    showToast("Login Successful 🎉", "success");

    setTimeout(() => {
      navigate("/dashboard");
    }, 700);
  };

  return (
    <main className="login-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>
      <div className="grid-bg"></div>

      <header className="login-header">
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

      <section className="login-center">
        <div className="login-card-glow"></div>

        <div className="login-card">
          <div className="login-title">
            <h1>Welcome back!</h1>
            <p>Sign in to keep momentum on every goal.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
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

            <div className="form-group">
            

              <div className="input-box">
                <span className="input-icon">
                  <Lock size={18} />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

              <button
                type="button"
                className="forgot-btn"
                onClick={() =>
                  showToast("Forgot password feature coming later.", "warning")
                }
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-btn">
              LOGIN
            </button>

            <p className="signup-text">
              Don't have an account?{" "}
              <button type="button" onClick={() => navigate("/signup")}>
                Sign up
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
              onClick={() =>
                showToast("Google logincoming soon", "warning")
              }
            >
              <FaGoogle />
            </button>

            <button
              type="button"
              onClick={() =>
                showToast("Apple login coming soon", "warning")
              }
            >
              <FaApple />
            </button>

            <button
              type="button"
              onClick={() =>
                showToast("Facebook login coming soon", "warning")
              }
            >
              <FaFacebookF />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;