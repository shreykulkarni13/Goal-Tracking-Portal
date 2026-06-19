import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Target,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  Send,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";
import "./ManagerDashboard.css";

/* ── Nav items ─────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",       icon: LayoutDashboard },
  { id: "pending",    label: "Pending Goals",    icon: Clock           },
  { id: "approved",   label: "Approved Goals",   icon: CheckCircle2    },
  { id: "rejected",   label: "Rejected Goals",   icon: XCircle         },
  { id: "completed",  label: "Completed Goals",  icon: Trophy          },
  { id: "profile",    label: "Profile",          icon: User            },
];

/* ── Status display config ─────────────────────────────────────────────── */
const STATUS_CFG = {
  pending:   { label: "Pending",   cls: "badge-pending",   Icon: Clock        },
  approved:  { label: "Approved",  cls: "badge-approved",  Icon: CheckCircle2 },
  rejected:  { label: "Rejected",  cls: "badge-rejected",  Icon: XCircle      },
  completed: { label: "Completed", cls: "badge-completed", Icon: Trophy       },
};

/* ═══════════════════════════════════════════════════════════════════════ */
function ManagerDashboard() {
  const navigate = useNavigate();

  /* ── Original state ── */
  const [goals,    setGoals]   = useState([]);
  /* Per-goal feedback map: { [goalId]: string } */
  const [feedbackValues, setFeedbackValues] = useState({});

  /* ── UI state ── */
  const [darkMode,     setDarkMode]     = useState(false);
  const [activeNav,    setActiveNav]    = useState("dashboard");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [managerName,  setManagerName]  = useState("Manager");

  /* ════════════════════════════════════════════════════════════════════
     ORIGINAL SUPABASE LOGIC — untouched
  ═══════════════════════════════════════════════════════════════════ */

  useEffect(() => {
    checkRole();
    fetchGoals();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  async function fetchGoals() {
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select(`
        *,
        profiles (
          full_name,
          department
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("GOALS ERROR:", error);
      setLoading(false);
      return;
    }

    setGoals(data);
    setLoading(false);
  }

  async function updateGoalStatus(goalId, newStatus) {
    const updateData = { status: newStatus };

    if (newStatus === "completed") {
      updateData.progress = 100;
    }

    if (newStatus === "pending") {
      updateData.progress = 0;
    }

    const { error } = await supabase
      .from("goals")
      .update(updateData)
      .eq("id", goalId);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Goal ${newStatus}!`);
    fetchGoals();
  }

  async function addFeedback(goalId) {
    const feedbackText = feedbackValues[goalId] || "";

    const { error } = await supabase
      .from("goals")
      .update({ feedback: feedbackText })
      .eq("id", goalId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Feedback Saved ✅");
    setFeedbackValues((prev) => ({ ...prev, [goalId]: "" }));
    fetchGoals();
  }

  async function checkRole() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", session.user.id)
      .single();

    if (error || data?.role !== "manager") {
      alert("Access Denied!");
      navigate("/");
      return;
    }

    if (data?.full_name) {
      setManagerName(data.full_name);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString();
  }

  /* ── Derived lists ── */
  const pendingGoals   = goals.filter((g) => g.status === "pending");
  const approvedGoals  = goals.filter((g) => g.status === "approved");
  const rejectedGoals  = goals.filter((g) => g.status === "rejected");
  const completedGoals = goals.filter((g) => g.status === "completed");

  /* ── Helpers ── */
  function scrollTo(id) {
    setActiveNav(id);
    setSidebarOpen(false);
    if (id === "profile") { navigate("/profile"); return; }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getInitials(name) {
    if (!name) return "M";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="md-root">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══════════════════ SIDEBAR ══════════════════════════════════ */}
      <aside className={`md-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="md-sidebar-brand">
          <div className="md-brand-icon">
            <Target size={20} />
          </div>
          <span className="md-brand-text">GoalPortal</span>
        </div>

        {/* Manager card */}
        <div className="md-user-card">
          <div className="md-avatar">{getInitials(managerName)}</div>
          <div className="md-user-info">
            <p className="md-user-name">{managerName}</p>
            <span className="md-user-role">Manager</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="md-nav">
          <p className="md-nav-label">Menu</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`md-nav-item ${activeNav === id ? "active" : ""}`}
              onClick={() => scrollTo(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activeNav === id && (
                <ChevronRight size={14} className="md-nav-arrow" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="md-sidebar-bottom">
          <button className="md-nav-item" onClick={() => navigate("/profile")}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            className="md-nav-item md-logout"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════ MAIN ═════════════════════════════════════ */}
      <main className="md-main">
        {/* Header */}
        <header className="md-header">
          <div className="md-header-left">
            <button
              className="md-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h1 className="md-page-title" id="dashboard">
                Manager Dashboard
              </h1>
              <p className="md-page-sub">
                Review employee goals, give feedback, and track progress.
              </p>
            </div>
          </div>
          <button
            className="md-theme-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="md-content">
          {/* Welcome card */}
          <div className="md-welcome-card">
            <div className="md-welcome-left">
              <Sparkles size={20} className="md-welcome-icon" />
              <div>
                <p className="md-welcome-title">
                  Welcome back, {managerName} 👋
                </p>
                <p className="md-welcome-sub">
                  You have{" "}
                  <strong>{pendingGoals.length}</strong> pending{" "}
                  {pendingGoals.length === 1 ? "goal" : "goals"} awaiting
                  review and{" "}
                  <strong>{completedGoals.length}</strong> completed.
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <section className="md-stats-row">
            <StatCard
              label="Total Goals"
              value={goals.length}
              icon={<BarChart3 size={22} />}
              variant="total"
            />
            <StatCard
              label="Pending"
              value={pendingGoals.length}
              icon={<Clock size={22} />}
              variant="pending"
            />
            <StatCard
              label="Approved"
              value={approvedGoals.length}
              icon={<CheckCircle2 size={22} />}
              variant="approved"
            />
            <StatCard
              label="Rejected"
              value={rejectedGoals.length}
              icon={<XCircle size={22} />}
              variant="rejected"
            />
            <StatCard
              label="Completed"
              value={completedGoals.length}
              icon={<Trophy size={22} />}
              variant="completed"
            />
          </section>

          {/* ── Pending ── */}
          <GoalSection
            id="pending"
            title="Pending Goals"
            icon={<Clock size={18} />}
            goals={pendingGoals}
            loading={loading}
            emptyText="No pending goals — all clear!"
            renderCard={(goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                formatDate={formatDate}
                feedbackValue={feedbackValues[goal.id] || ""}
                onFeedbackChange={(val) =>
                  setFeedbackValues((prev) => ({ ...prev, [goal.id]: val }))
                }
                onSaveFeedback={() => addFeedback(goal.id)}
                actions={
                  <>
                    <button
                      className="md-btn md-btn-approve"
                      onClick={() => updateGoalStatus(goal.id, "approved")}
                    >
                      <ThumbsUp size={15} />
                      Approve
                    </button>
                    <button
                      className="md-btn md-btn-reject"
                      onClick={() => updateGoalStatus(goal.id, "rejected")}
                    >
                      <ThumbsDown size={15} />
                      Reject
                    </button>
                  </>
                }
              />
            )}
          />

          {/* ── Approved ── */}
          <GoalSection
            id="approved"
            title="Approved Goals"
            icon={<CheckCircle2 size={18} />}
            goals={approvedGoals}
            loading={loading}
            emptyText="No approved goals yet."
            renderCard={(goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                formatDate={formatDate}
                showProgress
                feedbackValue={feedbackValues[goal.id] || ""}
                onFeedbackChange={(val) =>
                  setFeedbackValues((prev) => ({ ...prev, [goal.id]: val }))
                }
                onSaveFeedback={() => addFeedback(goal.id)}
                actions={
                  <button
                    className="md-btn md-btn-reopen"
                    onClick={() => updateGoalStatus(goal.id, "pending")}
                  >
                    <RotateCcw size={15} />
                    Reopen
                  </button>
                }
              />
            )}
          />

          {/* ── Rejected ── */}
          <GoalSection
            id="rejected"
            title="Rejected Goals"
            icon={<XCircle size={18} />}
            goals={rejectedGoals}
            loading={loading}
            emptyText="No rejected goals."
            renderCard={(goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                formatDate={formatDate}
                feedbackValue={feedbackValues[goal.id] || ""}
                onFeedbackChange={(val) =>
                  setFeedbackValues((prev) => ({ ...prev, [goal.id]: val }))
                }
                onSaveFeedback={() => addFeedback(goal.id)}
                actions={
                  <button
                    className="md-btn md-btn-reopen"
                    onClick={() => updateGoalStatus(goal.id, "pending")}
                  >
                    <RotateCcw size={15} />
                    Reopen
                  </button>
                }
              />
            )}
          />

          {/* ── Completed ── */}
          <GoalSection
            id="completed"
            title="Completed Goals"
            icon={<Trophy size={18} />}
            goals={completedGoals}
            loading={loading}
            emptyText="No completed goals yet."
            renderCard={(goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                formatDate={formatDate}
                showProgress
                feedbackValue={feedbackValues[goal.id] || ""}
                onFeedbackChange={(val) =>
                  setFeedbackValues((prev) => ({ ...prev, [goal.id]: val }))
                }
                onSaveFeedback={() => addFeedback(goal.id)}
                actions={
                  <button
                    className="md-btn md-btn-reopen"
                    onClick={() => updateGoalStatus(goal.id, "pending")}
                  >
                    <RotateCcw size={15} />
                    Reopen
                  </button>
                }
              />
            )}
          />
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════ SUB-COMPONENTS ════════════════════════════ */

function StatCard({ label, value, icon, variant }) {
  return (
    <div className={`md-stat-card md-stat-${variant}`}>
      <div className="md-stat-icon">{icon}</div>
      <div className="md-stat-body">
        <p className="md-stat-value">{value}</p>
        <p className="md-stat-label">{label}</p>
      </div>
    </div>
  );
}

function GoalSection({ id, title, icon, goals, loading, emptyText, renderCard }) {
  return (
    <section className="md-card" id={id}>
      <div className="md-card-header">
        <span className="md-card-icon">{icon}</span>
        <h2 className="md-card-title">{title}</h2>
        <span className="md-count-badge">{goals.length}</span>
      </div>

      {loading ? (
        <div className="md-empty">
          <p>Loading...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="md-empty">
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="md-goal-grid">
          {goals.map((goal) => renderCard(goal))}
        </div>
      )}
    </section>
  );
}

function GoalCard({
  goal,
  formatDate,
  showProgress = false,
  feedbackValue,
  onFeedbackChange,
  onSaveFeedback,
  actions,
}) {
  const cfg = STATUS_CFG[goal.status] || STATUS_CFG.pending;
  const StatusIcon = cfg.Icon;

  return (
    <div className="md-goal-card">
      {/* Top row: title + badge */}
      <div className="md-goal-top">
        <h3 className="md-goal-title">{goal.title}</h3>
        <span className={`md-badge ${cfg.cls}`}>
          <StatusIcon size={11} />
          {cfg.label}
        </span>
      </div>

      {/* Employee info */}
      <div className="md-employee-row">
        <span className="md-employee-chip">
          <User size={12} />
          {goal.profiles?.full_name || "Unknown"}
        </span>
        <span className="md-dept-chip">
          {goal.profiles?.department || "—"}
        </span>
      </div>

      {/* Description */}
      <p className="md-goal-desc">{goal.description}</p>

      {/* Meta row */}
      <div className="md-goal-meta">
        <span className="md-meta-item">
          <CalendarDays size={13} />
          Target: {goal.target_date || "—"}
        </span>
        <span className="md-meta-item">
          <CalendarDays size={13} />
          Created: {formatDate(goal.created_at)}
        </span>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="md-progress-wrap">
          <div className="md-progress-header">
            <span className="md-progress-label">Progress</span>
            <span className="md-progress-pct">{goal.progress || 0}%</span>
          </div>
          <div className="md-progress-track">
            <div
              className="md-progress-fill"
              style={{ width: `${goal.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Existing feedback */}
      {goal.feedback && (
        <div className="md-existing-feedback">
          <MessageSquare size={13} />
          <span>{goal.feedback}</span>
        </div>
      )}

      {/* Divider */}
      <div className="md-card-divider" />

      {/* Feedback textarea */}
      <div className="md-feedback-area">
        <label className="md-feedback-label">Add / Update Feedback</label>
        <textarea
          className="md-textarea"
          placeholder="Write feedback for this employee..."
          value={feedbackValue}
          onChange={(e) => onFeedbackChange(e.target.value)}
          rows={3}
        />
        <button className="md-btn md-btn-feedback" onClick={onSaveFeedback}>
          <Send size={14} />
          Save Feedback
        </button>
      </div>

      {/* Action buttons */}
      {actions && <div className="md-action-row">{actions}</div>}
    </div>
  );
}

export default ManagerDashboard;
