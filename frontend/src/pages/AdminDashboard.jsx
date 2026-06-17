import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function AdminDashboard() {
  const navigate = useNavigate();

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

  useEffect(() => {
    checkRole();
    fetchStats();
  }, []);

  async function fetchStats() {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .select("*");

    if (profilesError) {
      console.log(profilesError);
      return;
    }

    if (goalsError) {
      console.log(goalsError);
      return;
    }

    setUsers(profiles);

    setPendingUsers(
      profiles.filter(
        (user) => user.approval_status === "pending"
      )
    );

    setEmployeeCount(
      profiles.filter((user) => user.role === "employee").length
    );

    setManagerCount(
      profiles.filter((user) => user.role === "manager").length
    );

    setTotalGoals(goals.length);

    setPendingGoals(
      goals.filter((goal) => goal.status === "pending").length
    );

    setApprovedGoals(
      goals.filter((goal) => goal.status === "approved").length
    );

    setRejectedGoals(
      goals.filter((goal) => goal.status === "rejected").length
    );

    setCompletedGoals(
      goals.filter((goal) => goal.status === "completed").length
    );
  }

  async function updateUserStatus(userId, newStatus) {
    const { error } = await supabase
      .from("profiles")
      .update({
        approval_status: newStatus,
      })
      .eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`User ${newStatus}!`);

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
      alert(error.message);
      return;
    }

    alert(`Role changed to ${newRole}`);

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
      alert("Access Denied!");
      navigate("/");
      return;
    }
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

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <button
            onClick={() => navigate("/profile")}
            >
            Profile
      </button>

      <h2>Users</h2>
      <p>Employees: {employeeCount}</p>
      <p>Managers: {managerCount}</p>

      <h2>Goals</h2>
      <p>Total Goals: {totalGoals}</p>
      <p>Pending Goals: {pendingGoals}</p>
      <p>Approved Goals: {approvedGoals}</p>
      <p>Rejected Goals: {rejectedGoals}</p>
      <p>Completed Goals: {completedGoals}</p>

      <h2>Pending Registrations</h2>

      {pendingUsers.length === 0 && (
        <p>No Pending Registrations</p>
      )}

      {pendingUsers.map((user) => (
        <div key={user.id}>
          <p>Name: {user.full_name}</p>
          <p>Email: {user.email}</p>

          <button
            onClick={() =>
              updateUserStatus(user.id, "approved")
            }
          >
            Approve
          </button>

          <button
            onClick={() =>
              updateUserStatus(user.id, "rejected")
            }
          >
            Reject
          </button>

          <hr />
        </div>
      ))}

      <h2>All Users</h2>

      <input
        type="text"
        placeholder="Search by name, email, role, department"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <br />
      <br />

      {filteredUsers.length === 0 && (
        <p>No users found</p>
      )}

      {filteredUsers.map((user) => (
        <div key={user.id}>
          <p>Name: {user.full_name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Department: {user.department}</p>
          <p>Approval Status: {user.approval_status}</p>

          {user.role === "employee" && (
            <button
              onClick={() =>
                updateUserRole(user.id, "manager")
              }
            >
              Promote to Manager
            </button>
          )}

          {user.role === "manager" && (
            <button
              onClick={() =>
                updateUserRole(user.id, "employee")
              }
            >
              Demote to Employee
            </button>
          )}

          {user.role === "admin" && (
            <p>Administrator</p>
          )}

          <hr />
        </div>
      ))}

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default AdminDashboard;