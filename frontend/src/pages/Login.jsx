import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Target, Users } from "lucide-react";
import { supabase } from "../supabase/supabaseClient";
import "./Login.css";

const demoAccounts = [
  { role: "Admin", email: import.meta.env.VITE_DEMO_ADMIN_EMAIL, password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD, icon: ShieldCheck, description: "Platform and people overview" },
  { role: "Manager", email: import.meta.env.VITE_DEMO_MANAGER_EMAIL, password: import.meta.env.VITE_DEMO_MANAGER_PASSWORD, icon: Users, description: "Review team goal progress" },
  { role: "Employee", email: import.meta.env.VITE_DEMO_EMPLOYEE_EMAIL, password: import.meta.env.VITE_DEMO_EMPLOYEE_PASSWORD, icon: Target, description: "Create and update goals" },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;

      const user = data.user;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, department, approval_status")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw new Error(`Signed in, but your profile could not be loaded: ${profileError.message}`);
      if (!profile) throw new Error("Your account has no profile yet. Ask an administrator to create or approve your profile.");
      if (profile.approval_status === "pending") throw new Error("Your account is awaiting approval.");
      if (profile.approval_status === "rejected") throw new Error("Your account has been rejected.");
      if (!["admin", "manager", "employee"].includes(profile.role)) throw new Error("Your account has no valid portal role. Contact an administrator.");

      navigate(`/${profile.role}`, { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to sign in. Check your connection and try again.");
      try {
        await supabase.auth.signOut();
      } catch {
        // The sign-in/profile error is the actionable message; a network issue
        // during cleanup must not hide it.
      }
    } finally {
      setLoading(false);
    }
  };

  function selectDemo(account) {
    if (!account.email || !account.password) {
      setMessage(`The ${account.role.toLowerCase()} demo account is not configured. Add its VITE_DEMO_${account.role.toUpperCase()}_EMAIL and VITE_DEMO_${account.role.toUpperCase()}_PASSWORD values to frontend/.env.local.`);
      return;
    }
    setEmail(account.email);
    setPassword(account.password);
    setMessage(`${account.role} demo credentials filled. Select Sign in to continue.`);
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand" href="/" aria-label="Goal Tracking Portal home">
          <span className="brand-icon"><Target size={19} /></span>
          <span>GoalPortal <small>GOAL TRACKING</small></span>
        </a>
        <span className="secure-label"><LockKeyhole size={14} /> Secure workspace</span>
      </header>

      <section className="login-layout">
        <div className="login-intro">
          <span className="eyebrow"><Building2 size={15} /> COMPANY GOAL MANAGEMENT</span>
          <h1>Make progress<br />visible.</h1>
          <p>One clear view of team priorities, individual goals, and the work moving your organization forward.</p>
          <div className="intro-foot"><CheckCircle2 size={16} /> A shared workspace for measurable outcomes</div>
        </div>

        <div className="login-card">
          <div className="login-title">
            <span className="login-kicker">ACCOUNT ACCESS</span>
            <h2>Sign in to your workspace</h2>
            <p>Use your company credentials to continue.</p>
          </div>

          {message && <div className="login-message" role="status">{message}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <label className="form-label" htmlFor="email">Work email</label>
            <div className="input-box"><Mail size={17} /><input id="email" type="email" autoComplete="username" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div className="password-label"><label className="form-label" htmlFor="password">Password</label><button className="forgot-btn" type="button" onClick={() => setMessage("Password recovery is not configured yet. Ask your administrator to reset your Supabase account.")}>Forgot password?</button></div>
            <div className="input-box"><LockKeyhole size={17} /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" className="show-btn" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            <button className="login-btn" type="submit" disabled={loading}>{loading ? "Signing in…" : <>Sign in <ArrowRight size={16} /></>}</button>
          </form>

          <div className="demo-heading"><span>DEMO ACCESS</span><span>For evaluation</span></div>
          <div className="demo-grid">
            {demoAccounts.map(({ role, icon: Icon, description, ...account }) => <button className="demo-card" type="button" key={role} onClick={() => selectDemo({ role, ...account })}>
              <span className="demo-icon"><Icon size={17} /></span><span className="demo-copy"><strong>{role}</strong><small>{description}</small></span><ArrowRight size={15} className="demo-arrow" />
            </button>)}
          </div>
          <p className="signup-text">Need an account? <button type="button" onClick={() => navigate("/signup")}>Request access</button></p>
        </div>
      </section>

      <footer className="login-footer"><span>GoalPortal</span><span>Goal tracking for focused teams</span></footer>
    </main>
  );
}

export default Login;
