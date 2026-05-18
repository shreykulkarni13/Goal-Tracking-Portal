import { useState } from "react";
import "./App.css";

function App() {
  const [role, setRole] = useState("");
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState("");

  const addGoal = () => {
    if (goalTitle.trim() === "") return;

    const newGoal = {
      id: Date.now(),
      title: goalTitle,
      status: "Pending",
    };

    setGoals((prevGoals) => [...prevGoals, newGoal]);

    setGoalTitle("");
  };

  const approveGoal = (id) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id
          ? { ...goal, status: "Approved" }
          : goal
      )
    );
  };

  const rejectGoal = (id) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id
          ? { ...goal, status: "Rejected" }
          : goal
      )
    );
  };

  if (role === "employee") {
    return (
      <div className="container">
        <h1>Employee Dashboard</h1>

        <input
          type="text"
          placeholder="Enter Goal"
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
        />

        <button onClick={addGoal}>Add Goal</button>

        <br />

        <button onClick={() => setRole("")}>
          Logout
        </button>

        <div className="goals">
          {goals.length === 0 ? (
            <p>No goals added yet</p>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="card">
                <h3>{goal.title}</h3>
                <p>Status: {goal.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (role === "manager") {
    return (
      <div className="container">
        <h1>Manager Dashboard</h1>

        <button onClick={() => setRole("")}>
          Logout
        </button>

        {goals.length === 0 ? (
          <p>No goals available</p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="card">
              <h3>{goal.title}</h3>
              <p>Status: {goal.status}</p>

              <button onClick={() => approveGoal(goal.id)}>
                Approve
              </button>

              <button onClick={() => rejectGoal(goal.id)}>
                Reject
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="container">
        <h1>Admin Dashboard</h1>

        <button onClick={() => setRole("")}>
          Logout
        </button>

        {goals.length === 0 ? (
          <p>No goals found</p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="card">
              <h3>{goal.title}</h3>
              <p>Status: {goal.status}</p>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Goal Tracking Portal</h1>

      <button onClick={() => setRole("employee")}>
        Employee Login
      </button>

      <button onClick={() => setRole("manager")}>
        Manager Login
      </button>

      <button onClick={() => setRole("admin")}>
        Admin Login
      </button>
    </div>
  );
}

export default App;