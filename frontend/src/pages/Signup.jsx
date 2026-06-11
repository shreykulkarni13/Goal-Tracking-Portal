import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import "./Signup.css";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !department) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      // Create Auth User
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("AUTH DATA:", data);
      console.log("AUTH ERROR:", error);

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      if (!user) {
        alert("User creation failed");
        setLoading(false);
        return;
      }

      console.log("USER ID:", user.id);

      // Insert into profiles table
      const result = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            full_name: fullName,
            email: email,
            role: "employee",
            department: department,
          },
        ]);

      console.log("INSERT RESULT:", result);

      if (result.error) {
        alert(result.error.message);
        setLoading(false);
        return;
      }

      alert("Account created successfully!");

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setDepartment("");

    } catch (err) {
      console.error("CATCH ERROR:", err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Create Account</h1>

        <input
          className="signup-input"
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="signup-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="signup-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="signup-input"
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <button
          className="signup-btn"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}

export default Signup;