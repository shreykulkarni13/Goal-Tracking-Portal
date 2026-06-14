import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function AdminDashboard() {
  const navigate = useNavigate();
  
  const [employeeCount, setEmployeeCount] = useState(0);
  const [managerCount, setManagerCount] = useState(0);

  const [totalGoals, setTotalGoals] = useState(0);
  const [pendingGoals, setPendingGoals] = useState(0);
  const [approvedGoals, setApprovedGoals] = useState(0);
  const [rejectedGoals, setRejectedGoals] = useState(0);

  useEffect(() => {
    checkRole();
    fetchStats();
  }, []);

  async function fetchStats() 
  {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("role");
    
      const { data: goals } = await supabase
        .from("goals")
        .select("status");
    
      setEmployeeCount(
        profiles.filter(
          (user) => user.role === "employee"
        ).length
      );
    
      setManagerCount(
        profiles.filter(
          (user) => user.role === "manager"
        ).length
      );
    
      setTotalGoals(goals.length);
    
      setPendingGoals(
        goals.filter(
          (goal) => goal.status === "pending"
        ).length
      );
    
      setApprovedGoals(
        goals.filter(
          (goal) => goal.status === "approved"
        ).length
      );
    
      setRejectedGoals(
        goals.filter(
          (goal) => goal.status === "rejected"
        ).length
      );

      
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

    if (data?.role !== "admin") {
      alert("Access Denied!");
      navigate("/");
      return;
    }
  }

  return (
    <div>
      
      <h1>Admin Dashboard</h1>


       <h2>Users</h2>
         <p>Employees: {employeeCount}</p>
         
         <p>Managers: {managerCount}</p>
         
         <h2>Goals</h2>
         
         <p>Total Goals: {totalGoals}</p>
         
         <p>Pending Goals: {pendingGoals}</p>
         
         <p>Approved Goals: {approvedGoals}</p>
         
         <p>Rejected Goals: {rejectedGoals}</p>
         

      <button onClick={async () => {
        await supabase.auth.signOut();
        navigate("/");
      }}>
        Logout
      </button>

    </div>

    
  );
}

export default AdminDashboard;