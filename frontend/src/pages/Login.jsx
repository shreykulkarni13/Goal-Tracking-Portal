import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

function Login() 
{
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

const handleLogin = async () => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  console.log("LOGIN DATA:", data);
  console.log("LOGIN ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  const user = data.user;

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

  console.log("PROFILE:", profile);
  console.log("PROFILE ERROR:", profileError);

  if (profileError) {
    alert(profileError.message);
    await supabase.auth.signOut();
    return;
  }

  if (profile.approval_status === "pending") {
    alert("Your account is awaiting approval.");
    await supabase.auth.signOut();
    return;
  }

  if (profile.approval_status === "rejected") {
    alert("Your account has been rejected.");
    await supabase.auth.signOut();
    return;
  }

  alert("Login Successful 🎉");

  navigate("/dashboard");
};

  return (
    <div>
    <h1>Login</h1>

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) =>
        setEmail(e.target.value)
      }
    />

    <br />
    <br />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) =>
        setPassword(e.target.value)
      }
    />

    <br />
    <br />

    <button onClick={handleLogin}>
      Login
    </button>

    <br />
    <br />

    <button
      onClick={() => navigate("/signup")}
    >
      Create New Account
    </button>
    </div>
  );
}

export default Login;