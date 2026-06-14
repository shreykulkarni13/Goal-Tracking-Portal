import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [goals, setGoals] = useState([]);


  useEffect(() => 
    {
      checkRole();
      fetchGoals();
    }, []);

    async function fetchGoals() 
    {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });
    
      console.log("GOALS:", data);
      console.log("GOALS ERROR:", error);
    
      if (data) {
        setGoals(data);
      }
    }

    async function handleCreateGoal() 
    {
      const {
        data: { session },
      } = await supabase.auth.getSession();
    
      const { error } = await supabase
        .from("goals")
        .insert([
          {
            user_id: session.user.id,
            title: title,
            description: description,
            target_date: targetDate,
          },
        ]);
    
      if (error) {
        alert(error.message);
        return;
      }
    
      alert("Goal Created Successfully 🎉");
      
      fetchGoals();
    
      setTitle("");
      setDescription("");
      setTargetDate("");
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

    if (data?.role !== "employee") {
      alert("Access Denied!");
      navigate("/");
      return;
    }
  }

  return (
    <div>
      
           <h1>Employee Dashboard</h1>
     
     <input
       type="text"
       placeholder="Goal Title"
       value={title}
       onChange={(e) => setTitle(e.target.value)}
     />
     
     <br />
     <br />
     
     <textarea
       placeholder="Description (Optional)"
       value={description}
       onChange={(e) => setDescription(e.target.value)}
     />
     
     <br />
     <br />
     
     <input
       type="date"
       value={targetDate}
       onChange={(e) => setTargetDate(e.target.value)}
     />
     
     <br />
     <br />
     
     <button onClick={handleCreateGoal}>
       Create Goal
     </button>
     
     <br />
     <br />
     
     <h2>My Goals</h2>

      {goals.map((goal) => (
        <div key={goal.id}>
          <p><strong>Title:</strong> {goal.title}</p>
      
          <p><strong>Description:</strong> {goal.description}</p>
      
          <p><strong>Status:</strong> {goal.status}</p>
      
          <p><strong>Target Date:</strong> {goal.target_date}</p>
      
          <hr />
        </div>
      ))}
    
     <button
       onClick={async () => {
         await supabase.auth.signOut();
         navigate("/");
       }}
     >
       Logout
     </button>

    </div>
  );
}

export default EmployeeDashboard;