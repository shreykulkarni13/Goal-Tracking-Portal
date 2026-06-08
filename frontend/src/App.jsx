import "./App.css";

function App() {
  return (
    <div className="app">
      <div className="hero">
        <h1>Goal Tracking Portal</h1>

        <p>
          Enterprise Goal Management & Performance Tracking Platform
        </p>

        <div className="role-buttons">
          <button>Employee Login</button>
          <button>Manager Login</button>
          <button>Admin Login</button>
        </div>

        <div className="features">
          <div className="card">
            <h3>Goal Management</h3>
            <p>Create, assign and track organizational goals.</p>
          </div>

          <div className="card">
            <h3>Performance Tracking</h3>
            <p>Monitor progress and completion metrics.</p>
          </div>

          <div className="card">
            <h3>Manager Reviews</h3>
            <p>Approve, review and evaluate employee goals.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;