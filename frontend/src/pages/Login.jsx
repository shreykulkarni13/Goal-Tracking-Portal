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