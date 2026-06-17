import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function ManagerDashboard() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    checkRole();
    fetchGoals();
  }, []);

  async function fetchGoals() {
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
      return;
    }

    setGoals(data);
  }

async function updateGoalStatus(goalId, newStatus) {
  const updateData = {
    status: newStatus,
  };

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
    const { error } = await supabase
      .from("goals")
      .update({ feedback })
      .eq("id", goalId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Feedback Saved ✅");
    setFeedback("");
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
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (error || data?.role !== "manager") {
      alert("Access Denied!");
      navigate("/");
    }

    if (newStatus === "completed") 
         {progress = 100;}
  }

  function formatDate(dateString) {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString();
  }

  const pendingGoals = goals.filter((goal) => goal.status === "pending");
  const approvedGoals = goals.filter((goal) => goal.status === "approved");
  const rejectedGoals = goals.filter((goal) => goal.status === "rejected");
  const completedGoals = goals.filter((goal) => goal.status === "completed");

  return (
    <div>
      <h1>Manager Dashboard</h1>

      <button
            onClick={() => navigate("/profile")}
          >
            Profile
      </button>

      <h2>Goal Statistics</h2>
      <p>Pending Goals: {pendingGoals.length}</p>
      <p>Approved Goals: {approvedGoals.length}</p>
      <p>Rejected Goals: {rejectedGoals.length}</p>
      <p>Completed Goals: {completedGoals.length}</p>

      <hr />

      <h2>Pending Goals</h2>

      {pendingGoals.length === 0 && <p>No pending goals.</p>}

      {pendingGoals.map((goal) => (
        <div key={goal.id}>
          <p><strong>Employee:</strong> {goal.profiles?.full_name}</p>
          <p><strong>Department:</strong> {goal.profiles?.department}</p>
          <p><strong>Title:</strong> {goal.title}</p>
          <p><strong>Description:</strong> {goal.description}</p>
          <p><strong>Target Date:</strong> {goal.target_date}</p>
          <p><strong>Created Date:</strong> {formatDate(goal.created_at)}</p>
          <p><strong>Feedback:</strong> {goal.feedback || "No feedback yet"}</p>

          <textarea
            placeholder="Enter feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <br />

          <button onClick={() => addFeedback(goal.id)}>
            Save Feedback
          </button>

          <button onClick={() => updateGoalStatus(goal.id, "approved")}>
            Approve
          </button>

          <button onClick={() => updateGoalStatus(goal.id, "rejected")}>
            Reject
          </button>

          <hr />
        </div>
      ))}

      <h2>Approved Goals</h2>

      {approvedGoals.length === 0 && <p>No approved goals.</p>}

      {approvedGoals.map((goal) => (
        <div key={goal.id}>
          <p><strong>Employee:</strong> {goal.profiles?.full_name}</p>
          <p><strong>Department:</strong> {goal.profiles?.department}</p>
          <p><strong>Title:</strong> {goal.title}</p>
          <p><strong>Description:</strong> {goal.description}</p>
          <p><strong>Target Date:</strong> {goal.target_date}</p>
          <p><strong>Created Date:</strong> {formatDate(goal.created_at)}</p>
          <p><strong>Progress:</strong> {goal.progress || 0}%</p>

          <progress value={goal.progress || 0} max="100"></progress>

          <p><strong>Feedback:</strong> {goal.feedback || "No feedback yet"}</p>

          <textarea
            placeholder="Enter feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <br />

          <button onClick={() => addFeedback(goal.id)}>
            Save Feedback
          </button>

          <button onClick={() => updateGoalStatus(goal.id, "pending")}>
            Reopen
          </button>

          <hr />
        </div>
      ))}

      <h2>Rejected Goals</h2>

      {rejectedGoals.length === 0 && <p>No rejected goals.</p>}

      {rejectedGoals.map((goal) => (
        <div key={goal.id}>
          <p><strong>Employee:</strong> {goal.profiles?.full_name}</p>
          <p><strong>Department:</strong> {goal.profiles?.department}</p>
          <p><strong>Title:</strong> {goal.title}</p>
          <p><strong>Description:</strong> {goal.description}</p>
          <p><strong>Target Date:</strong> {goal.target_date}</p>
          <p><strong>Created Date:</strong> {formatDate(goal.created_at)}</p>
          <p><strong>Feedback:</strong> {goal.feedback || "No feedback yet"}</p>

          <textarea
            placeholder="Enter feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <br />

          <button onClick={() => addFeedback(goal.id)}>
            Save Feedback
          </button>

          <button onClick={() => updateGoalStatus(goal.id, "pending")}>
            Reopen
          </button>

          <hr />
        </div>
      ))}

      <h2>Completed Goals</h2>

      {completedGoals.length === 0 && <p>No completed goals.</p>}

      {completedGoals.map((goal) => (
        <div key={goal.id}>
          <p><strong>Employee:</strong> {goal.profiles?.full_name}</p>
          <p><strong>Department:</strong> {goal.profiles?.department}</p>
          <p><strong>Title:</strong> {goal.title}</p>
          <p><strong>Description:</strong> {goal.description}</p>
          <p><strong>Target Date:</strong> {goal.target_date}</p>
          <p><strong>Created Date:</strong> {formatDate(goal.created_at)}</p>
          <p><strong>Progress:</strong> {goal.progress || 0}%</p>

          <progress value={goal.progress || 0} max="100"></progress>
          

          <p><strong>Feedback:</strong> {goal.feedback || "No feedback yet"}</p>

          <textarea
            placeholder="Enter feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <br />

          <button onClick={() => addFeedback(goal.id)}>
            Save Feedback
          </button>

          <button onClick={() => updateGoalStatus(goal.id, "pending")}>
            Reopen
          </button>

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

export default ManagerDashboard;