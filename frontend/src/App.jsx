import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [role, setRole] = useState("");
  const [goals, setGoals] = useState(() => {
  const savedGoals = localStorage.getItem("goals");
  return savedGoals ? JSON.parse(savedGoals) : [];
});

useEffect(() => {
  localStorage.setItem("goals", JSON.stringify(goals));
}, [goals]);

  const [goalTitle, setGoalTitle] = useState("");

  const addGoal = () => {
    if (goalTitle.trim() === "") return;

    const newGoal = {
      id: Date.now(),
      title: goalTitle,
      status: "Pending",
    };

    setGoals([...goals, newGoal]);
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

  const getStatusClass = (status) => {
    if (status === "Approved") return "approved";
    if (status === "Rejected") return "rejected";
    return "pending";
  };

  if (role === "employee") {
    return (
      <div className="container">
        <div className="topbar">
          <h1 className="dashboard-title">
            Employee Dashboard
          </h1>

          <button
            className="logout-btn"
            onClick={() => setRole("")}
          >
            Logout
          </button>
        </div>

        <div className="add-goal-section">
          <input
            type="text"
            placeholder="Enter your goal..."
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
          />

          <button onClick={addGoal}>
            Add Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="empty-text">
            No goals added yet.
          </p>
        ) : (
          <div className="cards-container">
            {goals.map((goal) => (
              <div key={goal.id} className="goal-card">
                <h3>{goal.title}</h3>

                <p className={`status ${getStatusClass(goal.status)}`}>
                  {goal.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (role === "manager") {
    return (
      <div className="container">
        <div className="topbar">
          <h1 className="dashboard-title">
            Manager Dashboard
          </h1>

          <button
            className="logout-btn"
            onClick={() => setRole("")}
          >
            Logout
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="empty-text">
            No goals available.
          </p>
        ) : (
          <div className="cards-container">
            {goals.map((goal) => (
              <div key={goal.id} className="goal-card">
                <h3>{goal.title}</h3>

                <p className={`status ${getStatusClass(goal.status)}`}>
                  {goal.status}
                </p>

                <div className="action-buttons">
                  <button
                    className="approve-btn"
                    onClick={() => approveGoal(goal.id)}
                  >
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => rejectGoal(goal.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="container">
        <div className="topbar">
          <h1 className="dashboard-title">
            Admin Dashboard
          </h1>

          <button
            className="logout-btn"
            onClick={() => setRole("")}
          >
            Logout
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="empty-text">
            No goals found.
          </p>
        ) : (
          <div className="cards-container">
            {goals.map((goal) => (
              <div key={goal.id} className="goal-card">
                <h3>{goal.title}</h3>

                <p className={`status ${getStatusClass(goal.status)}`}>
                  {goal.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container home">
      <h1 className="portal-title">
        Goal Tracking Portal
      </h1>

      <p className="portal-subtitle">
        In-House Goal Setting & Performance Tracking System
      </p>

      <div className="role-buttons">
        <button onClick={() => setRole("employee")}>
          Employee
        </button>

        <button onClick={() => setRole("manager")}>
          Manager
        </button>

        <button onClick={() => setRole("admin")}>
          Admin
        </button>
      </div>
    </div>
  );
}

export default App;