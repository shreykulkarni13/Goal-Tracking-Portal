import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goals, setGoals] = useState([]);
  const [progressValue, setProgressValue] = useState("");

  useEffect(() => {
    checkRole();
    fetchGoals();
  }, []);

  async function fetchGoals() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    console.log("GOALS:", data);
    console.log("GOALS ERROR:", error);

    if (data) {
      setGoals(data);
    }
  }

  async function handleCreateGoal() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase
      .from("goals")
      .insert([
        {
          user_id: session.user.id,
          title,
          description,
          target_date: targetDate,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Goal Created Successfully 🎉");

    fetchGoals();

    setTitle("");
    setDescription("");
    setTargetDate("");
  }

  async function completeGoal(goalId) {
    const { error } = await supabase
      .from("goals")
      .update({
        status: "completed",
      })
      .eq("id", goalId);

    console.log("COMPLETE ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Goal Completed 🎉");

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

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (data?.role !== "employee") {
      alert("Access Denied!");
      navigate("/");
    }
  }


     async function updateProgress(goalId) {
               const { error } = await supabase
                 .from("goals")
                 .update({
                   progress: Number(progressValue),
                 })
                 .eq("id", goalId);
             
               console.log("PROGRESS ERROR:", error);
             
               if (error) {
                 alert(error.message);
                 return;
               }
             
               alert("Progress Updated ✅");
             
               setProgressValue("");
             
               fetchGoals();
             } 

  const pendingGoals = goals.filter(
    (goal) => goal.status === "pending"
  );

  const approvedGoals = goals.filter(
    (goal) => goal.status === "approved"
  );

  const rejectedGoals = goals.filter(
    (goal) => goal.status === "rejected"
  );

  const completedGoals = goals.filter(
    (goal) => goal.status === "completed"
  );

  return (
    <div>
      <h1>Employee Dashboard</h1>

      <input
        type="text"
        placeholder="Goal Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br />
      <br />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br />
      <br />

      <input
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleCreateGoal}>
        Create Goal
      </button>

      <hr />

      <h2>Pending Goals</h2>

      {pendingGoals.length === 0 && <p>No Pending Goals</p>}

      {pendingGoals.map((goal) => (
        <div key={goal.id}>

          <p>Title: {goal.title}</p>
          <p>Description: {goal.description}</p>
            <p>
              <strong>Feedback:</strong> {goal.feedback || "No feedback yet"}
            </p>            
             <p>Target Date: {goal.target_date}</p>
        </div>
      ))}

      <h2>Approved Goals</h2>

      {approvedGoals.length === 0 && <p>No Approved Goals</p>}

      {approvedGoals.map((goal) => (
        <div key={goal.id}>
          <p>Title: {goal.title}</p>
          <p>Description: {goal.description}</p>
          <p>
             <strong>Feedback:</strong>{" "}
             {goal.feedback || "No feedback yet"}
          </p>

          <p><strong>Progress:</strong> {goal.progress}%</p>

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Update Progress"
              onChange={(e) =>
                setProgressValue(e.target.value)
              }
            />
            
            <button
              onClick={() =>
                updateProgress(goal.id)
              }
            >
              Update Progress
            </button>
            
            
          <p>Target Date: {goal.target_date}</p>

          <button
            onClick={() => completeGoal(goal.id)}
          >
            Mark Complete
          </button>

          <hr />
        </div>
      ))}

      <h2>Rejected Goals</h2>

      {rejectedGoals.length === 0 && <p>No Rejected Goals</p>}

      {rejectedGoals.map((goal) => (
        <div key={goal.id}>
          <p>Title: {goal.title}</p>
          <p>Description: {goal.description}</p>
          <p>
             <strong>Feedback:</strong>{" "}
             {goal.feedback || "No feedback yet"}
          </p>
          <p>Target Date: {goal.target_date}</p>
          <hr />
        </div>
      ))}

      <h2>Completed Goals</h2>

      {completedGoals.length === 0 && <p>No Completed Goals</p>}

      {completedGoals.map((goal) => (
        <div key={goal.id}>
          <p>Title: {goal.title}</p>
          <p>Description: {goal.description}</p>
          <p>
             <strong>Feedback:</strong>{" "}
             {goal.feedback || "No feedback yet"}
          </p>
          <p>Target Date: {goal.target_date}</p>
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

export default EmployeeDashboard;