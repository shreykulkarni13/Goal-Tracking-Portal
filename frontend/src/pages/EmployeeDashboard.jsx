import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Target,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  CalendarDays,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Trophy,
  BarChart3,
  Menu,
  X,
  Lightbulb,
} from "lucide-react";
import "./EmployeeDashboard.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "my-goals", label: "My Goals", icon: ListChecks },
  { id: "create-goal", label: "Create Goal", icon: PlusCircle },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "profile", label: "Profile", icon: User },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "badge-pending", icon: Clock },
  approved: { label: "Approved", className: "badge-approved", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "badge-rejected", icon: XCircle },
  completed: { label: "Completed", className: "badge-completed", icon: Trophy },
};

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goals, setGoals] = useState([]);
  const [progressValues, setProgressValues] = useState({});
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") 
    {
        setToast({ message, type });
    
        setTimeout(() => {
          setToast(null);
        }, 3500);
    }

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  useEffect(() => {
    checkRole();
    fetchGoals();
  }, []);

async function fetchGoals() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    navigate("/");
    return;
  }

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    showToast(error.message, "error");
    return;
  }

  setGoals(data || []);
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
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || data?.role !== "employee") {
      showToast("Access Denied!", "error");
      navigate("/");
      return;
    }

    setProfile(data);
  }

  async function handleCreateGoal() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!title || !targetDate) {
      showToast("Please enter goal title and target date.", "error");
      return;
    }

    const { error } = await supabase.from("goals").insert([
      {
        user_id: session.user.id,
        title,
        description,
        target_date: targetDate,
        status: "pending",
        progress: 0,
      },
    ]);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Goal Created Successfully 🎉", "success");

    setTitle("");
    setDescription("");
    setTargetDate("");
    fetchGoals();
  }

  async function updateProgress(goalId) {
    const progressNumber = Number(progressValues[goalId]);

    if (progressNumber < 0 || progressNumber > 100) {
      showToast("Progress must be between 0 and 100.", "error");
      return;
    }

    const newStatus = progressNumber >= 100 ? "completed" : "approved";

    const { error } = await supabase
      .from("goals")
      .update({
        progress: progressNumber,
        status: newStatus,
      })
      .eq("id", goalId);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Progress Updated ✅", "success");

    setProgressValues((prev) => ({
      ...prev,
      [goalId]: "",
    }));

    fetchGoals();
  }

  async function completeGoal(goalId) {
    const { error } = await supabase
      .from("goals")
      .update({
        status: "completed",
        progress: 100,
      })
      .eq("id", goalId);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast("Goal Completed 🎉", "success");
    fetchGoals();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function scrollTo(sectionId) {
    if (sectionId === "profile") {
      navigate("/profile");
      return;
    }

    setActiveNav(sectionId);
    setSidebarOpen(false);

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function getInitials(name) {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const pendingGoals = goals.filter((goal) => goal.status === "pending");
  const approvedGoals = goals.filter((goal) => goal.status === "approved");
  const rejectedGoals = goals.filter((goal) => goal.status === "rejected");
  const completedGoals = goals.filter((goal) => goal.status === "completed");

  return (
    <div className="ed-root">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      {sidebarOpen && (
        <div className="ed-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`ed-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ed-sidebar-brand">
          <div className="ed-brand-icon">
            <Target size={20} />
          </div>
          <span className="ed-brand-text">GoalPortal</span>
        </div>

        <div className="ed-user-card">
          <div className="ed-avatar">{getInitials(profile?.full_name)}</div>

          <div className="ed-user-info">
            <p className="ed-user-name">{profile?.full_name || "Employee"}</p>
            <span className="ed-user-role">Employee</span>
          </div>
        </div>

        <nav className="ed-nav">
          <p className="ed-nav-label">Menu</p>

          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`ed-nav-item ${activeNav === id ? "active" : ""}`}
              onClick={() => scrollTo(id)}
            >
              <Icon size={18} />
              <span>{label}</span>

              {activeNav === id && (
                <ChevronRight size={14} className="ed-nav-arrow" />
              )}
            </button>
          ))}
        </nav>

        <div className="ed-sidebar-bottom">
          <button className="ed-nav-item" onClick={() => navigate("/profile")}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button className="ed-nav-item ed-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ed-main">
        <header className="ed-header">
          <div className="ed-header-left">

            <section className="ed-welcome-card">
  <h2>Welcome back, {profile?.full_name} 👋</h2>
  <p>
    You have {pendingGoals.length} pending goals and
    {approvedGoals.length} approved goals.
  </p>
</section>

            <button
              className="ed-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div>
              <h1 className="ed-page-title" id="dashboard">
                Employee Dashboard
              </h1>
              <p className="ed-page-sub">
                Track your goals, progress, and feedback.
              </p>
            </div>
          </div>

          <button
            className="ed-theme-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="ed-content">
          <section className="ed-stats-row">
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
              label="Completed"
              value={completedGoals.length}
              icon={<Trophy size={22} />}
              variant="completed"
            />
          </section>

          <section className="ed-card" id="create-goal">
            <div className="ed-card-header">
              <PlusCircle size={20} className="ed-card-icon" />
              <h2 className="ed-card-title">Create New Goal</h2>
            </div>

            <div className="ed-create-layout">
              <div className="ed-create-form">
                <div className="ed-field">
                  <label className="ed-label">Goal Title</label>
                  <input
                    className="ed-input"
                    type="text"
                    placeholder="e.g. Learn React Hooks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="ed-field">
                  <label className="ed-label">Description</label>
                  <textarea
                    className="ed-textarea"
                    placeholder="Describe your goal..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="ed-field ed-field-date">
                  <label className="ed-label">Target Date</label>

                  <div className="ed-input-icon-wrap">
                    <CalendarDays size={16} className="ed-input-icon" />
                    <input
                      className="ed-input ed-date-input"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>

                <button className="ed-btn-primary" onClick={handleCreateGoal}>
                  <PlusCircle size={17} />
                  Create Goal
                </button>
              </div>

              <div className="ed-goal-tips">
                <div className="ed-goal-tips-icon">
                  <Lightbulb size={20} />
                </div>

                <h3>Goal Tips</h3>
                <p>Write clear goals to get faster approval.</p>

                <ul>
                  <li>Keep the title short and clear</li>
                  <li>Add a measurable outcome</li>
                  <li>Set a realistic target date</li>
                  <li>Update progress regularly</li>
                </ul>
              </div>
            </div>
          </section>

          <div id="my-goals" className="ed-goals-scroll-anchor" />

          <GoalSection
            id="pending"
            title="Pending Goals"
            icon={<Clock size={18} />}
            goals={pendingGoals}
            emptyText="No pending goals."
            renderGoal={(goal) => <GoalCard key={goal.id} goal={goal} />}
          />

          <GoalSection
            id="approved"
            title="Approved Goals"
            icon={<CheckCircle2 size={18} />}
            goals={approvedGoals}
            emptyText="No approved goals yet."
            renderGoal={(goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                showProgress
                showActions
                progressValue={progressValues[goal.id] || ""}
                onProgressChange={(value) =>
                  setProgressValues((prev) => ({
                    ...prev,
                    [goal.id]: value,
                  }))
                }
                onUpdateProgress={() => updateProgress(goal.id)}
                onComplete={() => completeGoal(goal.id)}
              />
            )}
          />

          <GoalSection
            id="rejected"
            title="Rejected Goals"
            icon={<XCircle size={18} />}
            goals={rejectedGoals}
            emptyText="No rejected goals."
            renderGoal={(goal) => <GoalCard key={goal.id} goal={goal} />}
          />

          <GoalSection
            id="progress"
            title="Completed Goals"
            icon={<Trophy size={18} />}
            goals={completedGoals}
            emptyText="No completed goals yet."
            renderGoal={(goal) => (
              <GoalCard key={goal.id} goal={goal} showProgress />
            )}
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, variant }) {
  return (
    <div className={`ed-stat-card ed-stat-${variant}`}>
      <div className="ed-stat-icon">{icon}</div>

      <div>
        <p className="ed-stat-value">{value}</p>
        <p className="ed-stat-label">{label}</p>
      </div>
    </div>
  );
}

function GoalSection({ id, title, icon, goals, emptyText, renderGoal }) {
  return (
    <section className="ed-card" id={id}>
      <div className="ed-card-header">
        <span className="ed-card-icon">{icon}</span>
        <h2 className="ed-card-title">{title}</h2>
        <span className="ed-count-badge">{goals.length}</span>
      </div>

      {goals.length === 0 ? (
        <div className="ed-empty">
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="ed-goal-grid">{goals.map((goal) => renderGoal(goal))}</div>
      )}
    </section>
  );
}

function GoalCard({
  goal,
  showProgress = false,
  showActions = false,
  progressValue = "",
  onProgressChange,
  onUpdateProgress,
  onComplete,
}) {
  const cfg = STATUS_CONFIG[goal.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="ed-goal-card">
      <div className="ed-goal-top">
        <h3 className="ed-goal-title">{goal.title}</h3>

        <span className={`ed-badge ${cfg.className}`}>
          <StatusIcon size={12} />
          {cfg.label}
        </span>
      </div>

      <p className="ed-goal-desc">
        {goal.description || "No description provided."}
      </p>

      <div className="ed-goal-meta">
        <span className="ed-meta-item">
          <CalendarDays size={13} />
          {goal.target_date || "No target date"}
        </span>

        <span className="ed-meta-item ed-meta-feedback">
          <MessageSquare size={13} />
          {goal.feedback || "No feedback yet"}
        </span>
      </div>

      {showProgress && (
        <div className="ed-progress-wrap">
          <div className="ed-progress-header">
            <span className="ed-progress-label">Progress</span>
            <span className="ed-progress-pct">{goal.progress || 0}%</span>
          </div>

          <div className="ed-progress-track">
            <div
              className="ed-progress-fill"
              style={{ width: `${goal.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {showActions && (
        <div className="ed-goal-actions">
          <div className="ed-progress-input-row">
            <input
              className="ed-input ed-progress-input"
              type="number"
              min="0"
              max="100"
              placeholder="0-100"
              value={progressValue}
              onChange={(e) =>
                onProgressChange && onProgressChange(e.target.value)
              }
            />

            <button className="ed-btn-secondary" onClick={onUpdateProgress}>
              Update
            </button>
          </div>

          <button className="ed-btn-complete" onClick={onComplete}>
            <CheckCircle2 size={15} />
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;