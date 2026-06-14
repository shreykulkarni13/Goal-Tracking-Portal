import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function ManagerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    checkRole();
    fetchGoals();
  }, []);

  async function updateGoalStatus(goalId, newStatus) 
    {  
      console.log("GOAL ID:", goalId);
      console.log("NEW STATUS:", newStatus);

      const { data, error } = await supabase
        .from("goals")
        .update({
          status: newStatus,
        })
        .eq("id", goalId)
        .select();

        console.log("UPDATE DATA:", data);
    
      console.log("UPDATE ERROR:", error);
    
      if (error) {
        alert(error.message);
        return;
      }
    
      alert(`Goal ${newStatus}!`);
    
      fetchGoals();
   }    

       const [goals, setGoals] = useState([]);
     
       const pendingGoals = goals.filter(
       (goal) => goal.status === "pending"
        );
     
       const approvedGoals = goals.filter(
       (goal) => goal.status === "approved"
        );
     
       const rejectedGoals = goals.filter(
       (goal) => goal.status === "rejected"
        );

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

      <h2>Pending Goals</h2>

        {pendingGoals.map((goal) => (
          <div key={goal.id}>
            <p>Title: {goal.title}</p>
        
            <button
              onClick={() =>
                updateGoalStatus(goal.id, "approved")
              }
            >
              Approve
            </button>
        
            <button
              onClick={() =>
                updateGoalStatus(goal.id, "rejected")
              }
            >
              Reject
            </button>
        
            <hr />
          </div>
        ))}
          {pendingGoals.length === 0 && <p>No pending goals.</p>}   

      <h2>Approved Goals</h2>

        {approvedGoals.map((goal) => (
          <div key={goal.id}>
            <p>Title: {goal.title}</p>
        
            <button
              onClick={() =>
                updateGoalStatus(goal.id, "pending")
              }
            >
              Reopen
            </button>
        
            <hr />
          </div>
        ))}
         {approvedGoals.length === 0 && <p>No approved goals.</p>}

      <h2>Rejected Goals</h2>

        {rejectedGoals.map((goal) => (
         <div key={goal.id}>
           <p>Title: {goal.title}</p>
       
           <button
             onClick={() =>
               updateGoalStatus(goal.id, "pending")
             }
           >
             Reopen
           </button>
       
           <hr />
         </div>
        ))}
          {rejectedGoals.length === 0 && <p>No rejected goals.</p>} 

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