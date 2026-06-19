import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Target,
  Sun,
  Moon,
  ArrowLeft,
  LogOut,
  Mail,
  Briefcase,
  Building2,
  ShieldCheck,
  CalendarDays,
  Pencil,
  Save,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  BarChart3,
} from "lucide-react";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  /* ── Original state ── */
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);

  /* ── Edit form state ── */
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── UI state ── */
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  /* ════════════════════════════════════════════════════════════════════
     ORIGINAL SUPABASE LOGIC — preserved, alert() swapped for showToast()
  ═══════════════════════════════════════════════════════════════════ */

  async function fetchProfile() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      showToast(profileError.message, "error");
      setLoading(false);
      return;
    }

    setProfile(profileData);
    setFullName(profileData.full_name || "");
    setDepartment(profileData.department || "");

    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", session.user.id);

    if (goalsError) {
      console.log(goalsError);
      setLoading(false);
      return;
    }

    setGoals(goalsData);
    setLoading(false);
  }

  async function handleSaveChanges() {
    if (!fullName.trim() || !department.trim()) {
      showToast("Full name and department cannot be empty.", "error");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        department: department.trim(),
      })
      .eq("id", profile.id);

    if (error) {
      showToast(error.message, "error");
      setSaving(false);
      return;
    }

    showToast("Profile updated successfully ✅", "success");
    setProfile((prev) => ({
      ...prev,
      full_name: fullName.trim(),
      department: department.trim(),
    }));
    setSaving(false);
  }

  function handleBackToDashboard() {
    if (profile.role === "employee") {
      navigate("/employee");
    } else if (profile.role === "manager") {
      navigate("/manager");
    } else if (profile.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function getInitials(name) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  /* ── Loading state ── */
  if (loading || !profile) {
    return (
      <div className={`pf-page ${darkMode ? "dark-theme" : "light-theme"}`}>
        <div className="pf-loading">
          <div className="pf-spinner" />
          <p>Loading Profile...</p>
        </div>
      </div>
    );
  }

  /* ── Derived goal stats ── */
  const pendingGoals = goals.filter((g) => g.status === "pending");
  const approvedGoals = goals.filter((g) => g.status === "approved");
  const rejectedGoals = goals.filter((g) => g.status === "rejected");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <main className="pf-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>
      <div className="grid-bg"></div>

      {/* ── Header ── */}
      <header className="pf-header">
        <div className="brand">
          <div className="brand-icon">
            <Target size={20} />
          </div>
          <span>Goal Tracking Portal</span>
        </div>

        <div className="pf-header-actions">
          <button className="pf-back-btn" onClick={handleBackToDashboard}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <section className="pf-content">
        {/* ── Main profile card ── */}
        <div className="pf-card pf-main-card">
          <div className="pf-avatar-lg">{getInitials(profile.full_name)}</div>
          <h1 className="pf-name">{profile.full_name}</h1>
          <p className="pf-email">
            <Mail size={14} />
            {profile.email}
          </p>

          <div className="pf-badge-row">
            <span className="pf-badge pf-badge-role">
              <Briefcase size={12} />
              {profile.role}
            </span>
            <span
              className={`pf-badge ${
                profile.approval_status === "approved"
                  ? "pf-badge-approved"
                  : profile.approval_status === "rejected"
                  ? "pf-badge-rejected"
                  : "pf-badge-pending"
              }`}
            >
              <ShieldCheck size={12} />
              {profile.approval_status}
            </span>
          </div>

          {/* Goal stats strip */}
          <div className="pf-stats-strip">
            <div className="pf-stat-mini">
              <BarChart3 size={16} className="pf-stat-mini-icon stat-total" />
              <span className="pf-stat-mini-value">{goals.length}</span>
              <span className="pf-stat-mini-label">Total</span>
            </div>
            <div className="pf-stat-mini">
              <Clock size={16} className="pf-stat-mini-icon stat-pending" />
              <span className="pf-stat-mini-value">{pendingGoals.length}</span>
              <span className="pf-stat-mini-label">Pending</span>
            </div>
            <div className="pf-stat-mini">
              <CheckCircle2 size={16} className="pf-stat-mini-icon stat-approved" />
              <span className="pf-stat-mini-value">{approvedGoals.length}</span>
              <span className="pf-stat-mini-label">Approved</span>
            </div>
            <div className="pf-stat-mini">
              <XCircle size={16} className="pf-stat-mini-icon stat-rejected" />
              <span className="pf-stat-mini-value">{rejectedGoals.length}</span>
              <span className="pf-stat-mini-label">Rejected</span>
            </div>
            <div className="pf-stat-mini">
              <Trophy size={16} className="pf-stat-mini-icon stat-completed" />
              <span className="pf-stat-mini-value">{completedGoals.length}</span>
              <span className="pf-stat-mini-label">Completed</span>
            </div>
          </div>
        </div>

        {/* ── Edit Profile ── */}
        <div className="pf-card">
          <div className="pf-card-header">
            <Pencil size={18} className="pf-card-icon" />
            <h2 className="pf-card-title">Edit Profile</h2>
          </div>

          <div className="pf-form">
            <div className="pf-field">
              <label className="pf-label">Full Name</label>
              <input
                className="pf-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="pf-field">
              <label className="pf-label">Department</label>
              <input
                className="pf-input"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Enter your department"
              />
            </div>

            <button
              className="pf-btn-primary"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ── Account Info ── */}
        <div className="pf-card">
          <div className="pf-card-header">
            <ShieldCheck size={18} className="pf-card-icon" />
            <h2 className="pf-card-title">Account Info</h2>
          </div>

          <div className="pf-info-grid">
            <div className="pf-info-item">
              <span className="pf-info-icon">
                <Mail size={16} />
              </span>
              <div>
                <p className="pf-info-label">Email</p>
                <p className="pf-info-value">{profile.email}</p>
              </div>
            </div>

            <div className="pf-info-item">
              <span className="pf-info-icon">
                <Briefcase size={16} />
              </span>
              <div>
                <p className="pf-info-label">Role</p>
                <p className="pf-info-value pf-capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="pf-info-item">
              <span className="pf-info-icon">
                <Building2 size={16} />
              </span>
              <div>
                <p className="pf-info-label">Department</p>
                <p className="pf-info-value">{profile.department}</p>
              </div>
            </div>

            <div className="pf-info-item">
              <span className="pf-info-icon">
                <ShieldCheck size={16} />
              </span>
              <div>
                <p className="pf-info-label">Approval Status</p>
                <p className="pf-info-value pf-capitalize">
                  {profile.approval_status}
                </p>
              </div>
            </div>

            <div className="pf-info-item">
              <span className="pf-info-icon">
                <CalendarDays size={16} />
              </span>
              <div>
                <p className="pf-info-label">Joined Date</p>
                <p className="pf-info-value">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Account actions ── */}
        <div className="pf-card pf-danger-card">
          <div className="pf-card-header">
            <LogOut size={18} className="pf-card-icon pf-danger-icon" />
            <h2 className="pf-card-title">Account Actions</h2>
          </div>

          <p className="pf-danger-text">
            Logging out will end your current session on this device.
          </p>

          <button className="pf-btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}

export default Profile;
