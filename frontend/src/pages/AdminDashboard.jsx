import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  Target,
  LayoutDashboard,
  Users,
  Briefcase,
  ListChecks,
  BarChart3,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Mail,
  Building2,
  ArrowUpCircle,
  ArrowDownCircle,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import "./AdminDashboard.css";

/* ── Nav items ─────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "managers",  label: "Managers",  icon: Briefcase },
  { id: "goals",     label: "Goals",     icon: ListChecks },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "profile",   label: "Profile",   icon: User },
];

/* ── Goal status display config ───────────────────────────────────────── */
const STATUS_CFG = {
  pending:   { label: "Pending",   cls: "badge-pending",   Icon: Clock        },
  approved:  { label: "Approved",  cls: "badge-approved",  Icon: CheckCircle2 },
  rejected:  { label: "Rejected",  cls: "badge-rejected",  Icon: XCircle      },
  completed: { label: "Completed", cls: "badge-completed", Icon: Trophy       },
};

/* ═══════════════════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const navigate = useNavigate();

  /* ── Original state — untouched ── */
  const [employeeCount, setEmployeeCount] = useState(0);
  const [managerCount, setManagerCount] = useState(0);

  const [totalGoals, setTotalGoals] = useState(0);
  const [pendingGoals, setPendingGoals] = useState(0);
  const [approvedGoals, setApprovedGoals] = useState(0);
  const [rejectedGoals, setRejectedGoals] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);

  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [goals, setGoals] = useState([]);

  /* ── UI state ── */
  const [darkMode, setDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 3500);
}

  /* ════════════════════════════════════════════════════════════════════
     ORIGINAL SUPABASE LOGIC — preserved exactly, only extended minimally
     (adminProfile + goals list) so the new UI sections have real data.
  ═══════════════════════════════════════════════════════════════════ */

  useEffect(() => {
    checkRole();
    fetchStats();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  async function fetchStats() {
    setLoading(true);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select(`
        *,
        profiles (
          full_name,
          department
        )
      `);

    if (profilesError) {
      console.log(profilesError);
      setLoading(false);
      return;
    }

    if (goalsError) {
      console.log(goalsError);
      setLoading(false);
      return;
    }

    setUsers(profiles);

    setPendingUsers(
      profiles.filter((user) => user.approval_status === "pending")
    );

    setEmployeeCount(
      profiles.filter((user) => user.role === "employee").length
    );

    setManagerCount(
      profiles.filter((user) => user.role === "manager").length
    );

    setGoals(goalsData);

    setTotalGoals(goalsData.length);

    setPendingGoals(
      goalsData.filter((goal) => goal.status === "pending").length
    );

    setApprovedGoals(
      goalsData.filter((goal) => goal.status === "approved").length
    );

    setRejectedGoals(
      goalsData.filter((goal) => goal.status === "rejected").length
    );

    setCompletedGoals(
      goalsData.filter((goal) => goal.status === "completed").length
    );

    setLoading(false);
  }

  async function updateUserStatus(userId, newStatus) {
    const { error } = await supabase
      .from("profiles")
      .update({
        approval_status: newStatus,
      })
      .eq("id", userId);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast(`User ${newStatus}!`, "success");

    fetchStats();
  }

  async function updateUserRole(userId, newRole) {
    const { error } = await supabase
      .from("profiles")
      .update({
        role: newRole,
      })
      .eq("id", userId);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast(`Role changed to ${newRole}`, "success");

    fetchStats();
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

    if (error || data?.role !== "admin") {
      showToast("Access Denied!", "error");
      navigate("/");
      return;
    }

    setAdminProfile(data);
  }

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.full_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      user.department?.toLowerCase().includes(search)
    );
  });

  /* ── Derived for sections ── */
  const employees = filteredUsers.filter((u) => u.role === "employee");
  const managers = filteredUsers.filter((u) => u.role === "manager");
  const recentGoals = [...goals]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const completionRate =
    totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);
  const approvalRate =
    totalGoals === 0 ? 0 : Math.round((approvedGoals / totalGoals) * 100);

  /* ── Helpers ── */
function scrollTo(id) {
  setActiveNav(id);
  setSidebarOpen(false);

  if (id === "profile") {
    navigate("/profile");
    return;
  }

  const el = document.getElementById(id);

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
  

  function getInitials(name) {
    if (!name) return "A";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="ad-root">
       {toast && (
      <div className={`toast toast-${toast.type}`}>
        {toast.message}
      </div>
    )}
      {sidebarOpen && (
        <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══════════════════ SIDEBAR ══════════════════════════════════ */}
      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ad-sidebar-brand">
          <div className="ad-brand-icon">
            <Target size={20} />
          </div>
          <span className="ad-brand-text">GoalPortal</span>
        </div>

        <div className="ad-user-card">
          <div className="ad-avatar">
            {getInitials(adminProfile?.full_name)}
          </div>
          <div className="ad-user-info">
            <p className="ad-user-name">
              {adminProfile?.full_name || "Admin"}
            </p>
            <span className="ad-user-role">Admin</span>
          </div>
        </div>

        <nav className="ad-nav">
          <p className="ad-nav-label">Menu</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`ad-nav-item ${activeNav === id ? "active" : ""}`}
              onClick={() => scrollTo(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activeNav === id && (
                <ChevronRight size={14} className="ad-nav-arrow" />
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-bottom">
          <button className="ad-nav-item" onClick={() => navigate("/profile")}>
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            className="ad-nav-item ad-logout"
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
      <main className="ad-main">
        <header className="ad-header">
          <div className="ad-header-left">
            <button
              className="ad-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h1 className="ad-page-title" id="dashboard">
                Admin Dashboard
              </h1>
              <p className="ad-page-sub">
                Manage employees, managers, goals and platform analytics.
              </p>
            </div>
          </div>
          <button
            className="ad-theme-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="ad-content">
          {/* Welcome banner */}
          <div className="ad-welcome-card">
            <div className="ad-welcome-left">
              <Sparkles size={20} className="ad-welcome-icon" />
              <div>
                <p className="ad-welcome-title">
                  Welcome back, {adminProfile?.full_name || "Admin"} 👋
                </p>
                <p className="ad-welcome-sub">
                  You have <strong>{employeeCount}</strong> employees,{" "}
                  <strong>{managerCount}</strong> managers and{" "}
                  <strong>{totalGoals}</strong> goals in the system.
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <section className="ad-stats-row">
            <StatCard label="Total Employees" value={employeeCount} icon={<Users size={22} />} variant="employees" />
            <StatCard label="Total Managers" value={managerCount} icon={<Briefcase size={22} />} variant="managers" />
            <StatCard label="Total Goals" value={totalGoals} icon={<BarChart3 size={22} />} variant="total" />
            <StatCard label="Pending Goals" value={pendingGoals} icon={<Clock size={22} />} variant="pending" />
            <StatCard label="Approved Goals" value={approvedGoals} icon={<CheckCircle2 size={22} />} variant="approved" />
            <StatCard label="Completed Goals" value={completedGoals} icon={<Trophy size={22} />} variant="completed" />
          </section>

          {/* ── Pending Registrations ── */}
          <section className="ad-card" id="pending-registrations">
            <div className="ad-card-header">
              <span className="ad-card-icon">
                <ShieldCheck size={18} />
              </span>
              <h2 className="ad-card-title">Pending Registrations</h2>
              <span className="ad-count-badge">{pendingUsers.length}</span>
            </div>

            {loading ? (
              <div className="ad-empty"><p>Loading...</p></div>
            ) : pendingUsers.length === 0 ? (
              <div className="ad-empty"><p>No pending registrations.</p></div>
            ) : (
              <div className="ad-goal-grid">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="ad-user-mini-card">
                    <div className="ad-avatar ad-avatar-sm">
                      {getInitials(user.full_name)}
                    </div>
                    <div className="ad-user-mini-info">
                      <p className="ad-user-mini-name">{user.full_name}</p>
                      <span className="ad-user-mini-email">
                        <Mail size={12} />
                        {user.email}
                      </span>
                    </div>
                    <div className="ad-action-row">
                      <button
                        className="ad-btn ad-btn-approve"
                        onClick={() => updateUserStatus(user.id, "approved")}
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>
                      <button
                        className="ad-btn ad-btn-reject"
                        onClick={() => updateUserStatus(user.id, "rejected")}
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Search ── */}
          <section className="ad-card">
            <div className="ad-card-header">
              <span className="ad-card-icon">
                <Search size={18} />
              </span>
              <h2 className="ad-card-title">Search Users</h2>
            </div>
            <div className="ad-search-box">
              <Search size={16} className="ad-search-icon" />
              <input
                className="ad-input ad-search-input"
                type="text"
                placeholder="Search by name, email, role, department"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          {/* ── Employees ── */}
          <section className="ad-card" id="employees">
            <div className="ad-card-header">
              <span className="ad-card-icon">
                <Users size={18} />
              </span>
              <h2 className="ad-card-title">Employees</h2>
              <span className="ad-count-badge">{employees.length}</span>
            </div>

            {loading ? (
              <div className="ad-empty"><p>Loading...</p></div>
            ) : employees.length === 0 ? (
              <div className="ad-empty"><p>No employees found.</p></div>
            ) : (
              <div className="ad-goal-grid">
                {employees.map((user) => (
                  <div key={user.id} className="ad-people-card">
                    <div className="ad-people-top">
                      <div className="ad-avatar ad-avatar-sm">
                        {getInitials(user.full_name)}
                      </div>
                      <div className="ad-people-info">
                        <p className="ad-people-name">{user.full_name}</p>
                        <span className="ad-dept-chip">
                          <Building2 size={11} />
                          {user.department || "—"}
                        </span>
                      </div>
                      <span
                        className={`ad-badge ${
                          user.approval_status === "approved"
                            ? "badge-approved"
                            : user.approval_status === "rejected"
                            ? "badge-rejected"
                            : "badge-pending"
                        }`}
                      >
                        {user.approval_status}
                      </span>
                    </div>

                    <span className="ad-email-row">
                      <Mail size={13} />
                      {user.email}
                    </span>

                    <div className="ad-action-row">
                      <button
                        className="ad-btn ad-btn-promote"
                        onClick={() => updateUserRole(user.id, "manager")}
                      >
                        <ArrowUpCircle size={14} />
                        Promote to Manager
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Managers ── */}
          <section className="ad-card" id="managers">
            <div className="ad-card-header">
              <span className="ad-card-icon">
                <Briefcase size={18} />
              </span>
              <h2 className="ad-card-title">Managers</h2>
              <span className="ad-count-badge">{managers.length}</span>
            </div>

            {loading ? (
              <div className="ad-empty"><p>Loading...</p></div>
            ) : managers.length === 0 ? (
              <div className="ad-empty"><p>No managers found.</p></div>
            ) : (
              <div className="ad-goal-grid">
                {managers.map((user) => (
                  <div key={user.id} className="ad-people-card">
                    <div className="ad-people-top">
                      <div className="ad-avatar ad-avatar-sm">
                        {getInitials(user.full_name)}
                      </div>
                      <div className="ad-people-info">
                        <p className="ad-people-name">{user.full_name}</p>
                        <span className="ad-dept-chip">
                          <Building2 size={11} />
                          {user.department || "—"}
                        </span>
                      </div>
                      <span
                        className={`ad-badge ${
                          user.approval_status === "approved"
                            ? "badge-approved"
                            : user.approval_status === "rejected"
                            ? "badge-rejected"
                            : "badge-pending"
                        }`}
                      >
                        {user.approval_status}
                      </span>
                    </div>

                    <span className="ad-email-row">
                      <Mail size={13} />
                      {user.email}
                    </span>

                    <div className="ad-action-row">
                      <button
                        className="ad-btn ad-btn-demote"
                        onClick={() => updateUserRole(user.id, "employee")}
                      >
                        <ArrowDownCircle size={14} />
                        Demote to Employee
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Goals Overview ── */}
          <section className="ad-card" id="goals">
            <div className="ad-card-header">
              <span className="ad-card-icon">
                <ListChecks size={18} />
              </span>
              <h2 className="ad-card-title">Goals Overview</h2>
              <span className="ad-count-badge">{goals.length}</span>
            </div>

            {loading ? (
              <div className="ad-empty"><p>Loading...</p></div>
            ) : recentGoals.length === 0 ? (
              <div className="ad-empty"><p>No goals found.</p></div>
            ) : (
              <div className="ad-goal-grid">
                {recentGoals.map((goal) => {
                  const cfg = STATUS_CFG[goal.status] || STATUS_CFG.pending;
                  const StatusIcon = cfg.Icon;
                  return (
                    <div key={goal.id} className="ad-goal-card">
                      <div className="ad-goal-top">
                        <h3 className="ad-goal-title">{goal.title}</h3>
                        <span className={`ad-badge ${cfg.cls}`}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </div>

                      <span className="ad-employee-chip">
                        <User size={12} />
                        {goal.profiles?.full_name || "Unknown"}
                      </span>

                      <div className="ad-progress-wrap">
                        <div className="ad-progress-header">
                          <span className="ad-progress-label">Progress</span>
                          <span className="ad-progress-pct">
                            {goal.progress || 0}%
                          </span>
                        </div>
                        <div className="ad-progress-track">
                          <div
                            className="ad-progress-fill"
                            style={{ width: `${goal.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      <span className="ad-meta-item">
                        <CalendarDays size={13} />
                        Due: {goal.target_date || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Analytics ── */}
          <section className="ad-card" id="analytics">
            <div className="ad-card-header">
              <span className="ad-card-icon">
                <BarChart3 size={18} />
              </span>
              <h2 className="ad-card-title">Analytics</h2>
            </div>

            <div className="ad-analytics-grid">
              <AnalyticsCard
                label="Goal Completion Rate"
                pct={completionRate}
                detail={`${completedGoals} of ${totalGoals} goals completed`}
              />
              <AnalyticsCard
                label="Approval Rate"
                pct={approvalRate}
                detail={`${approvedGoals} of ${totalGoals} goals approved`}
              />
              <AnalyticsCard
                label="Active Employees"
                pct={
                  employeeCount === 0
                    ? 0
                    : Math.round(
                        (employees.filter((e) => e.approval_status === "approved")
                          .length /
                          employeeCount) *
                          100
                      )
                }
                detail={`${employees.filter((e) => e.approval_status === "approved").length} of ${employeeCount} employees active`}
              />
              <AnalyticsCard
                label="Pending Share"
                pct={
                  totalGoals === 0
                    ? 0
                    : Math.round((pendingGoals / totalGoals) * 100)
                }
                detail={`${pendingGoals} of ${totalGoals} goals pending review`}
              />
            </div>
          </section>

          {/* ── Profile ── */}
          <section className="ad-card" id="profile">
            <div className="ad-card-header">
              <span className="ad-card-icon">
                <User size={18} />
              </span>
              <h2 className="ad-card-title">Admin Profile</h2>
            </div>

            <div className="ad-profile-card">
              <div className="ad-avatar ad-avatar-lg">
                {getInitials(adminProfile?.full_name)}
              </div>
              <div className="ad-profile-info">
                <p className="ad-profile-name">
                  {adminProfile?.full_name || "Admin"}
                </p>
                <span className="ad-email-row">
                  <Mail size={13} />
                  {adminProfile?.email || "—"}
                </span>
                <div className="ad-profile-meta-row">
                  <span className="ad-badge badge-approved">
                    {adminProfile?.role || "admin"}
                  </span>
                  <span className="ad-dept-chip">
                    <Building2 size={11} />
                    {adminProfile?.department || "—"}
                  </span>
                </div>
              </div>
              <button
                className="ad-btn-primary"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════ SUB-COMPONENTS ════════════════════════════ */

function StatCard({ label, value, icon, variant }) {
  return (
    <div className={`ad-stat-card ad-stat-${variant}`}>
      <div className="ad-stat-icon">{icon}</div>
      <div className="ad-stat-body">
        <p className="ad-stat-value">{value}</p>
        <p className="ad-stat-label">{label}</p>
      </div>
    </div>
  );
}

function AnalyticsCard({ label, pct, detail }) {
  return (
    <div className="ad-analytics-card">
      <div className="ad-analytics-header">
        <span className="ad-analytics-label">{label}</span>
        <span className="ad-analytics-pct">{pct}%</span>
      </div>
      <div className="ad-progress-track">
        <div className="ad-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="ad-analytics-detail">{detail}</p>
    </div>
  );
}

export default AdminDashboard;
