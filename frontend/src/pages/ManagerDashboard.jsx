import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function ManagerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    checkRole();
    fetchGoals();
  }, []);

  const [goals, setGoals] = useState([]);

  async function fetchGoals() 
  {
       const { data, error } = await supabase
         .from("goals")
         .select("*");
     
       console.log("GOALS:", data);
       console.log("GOALS ERROR:", error);
     
       if (data) {
         setGoals(data);
       }
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

    console.log("ROLE:", data);
    console.log("ERROR:", error);

    if (data?.role !== "manager") {
      alert("Access Denied!");
      navigate("/");
      return;
    }
  }

  return (
    <div>
      
      <h1>Manager Dashboard</h1>

      <h2>Goals</h2>

       {goals.map((goal) => (
         <div key={goal.id}>
           <p>Title: {goal.title}</p>
           <p>Status: {goal.status}</p>
           <hr />
         </div>
       ))}

      <button onClick={async () => {
        await supabase.auth.signOut();
        navigate("/");
      }}>
        Logout
      </button> 

    </div>
  );
}

export default ManagerDashboard;