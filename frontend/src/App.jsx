import { useState } from "react";

function App() {
  const [role, setRole] = useState("");

  if (role === "employee") {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Employee Dashboard</h1>
        <button>Add Goal</button>
      </div>
    );
  }

  if (role === "manager") {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Manager Dashboard</h1>
        <button>Approve Goals</button>
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Admin Dashboard</h1>
        <button>View All Goals</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Goal Tracking Portal</h1>

      <button onClick={() => setRole("employee")}>
        Employee Login
      </button>

      <br /><br />

      <button onClick={() => setRole("manager")}>
        Manager Login
      </button>

      <br /><br />

      <button onClick={() => setRole("admin")}>
        Admin Login
      </button>
    </div>
  );
}

export default App;