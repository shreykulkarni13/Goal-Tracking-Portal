import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function Dashboard() 
{
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

    function showToast(message, type = "success") 
    {
        setToast({ message, type });
    
        setTimeout(() => {
          setToast(null);
        }, 3500);
    }

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser()
  {
  const 
  {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("SESSION:", session);

  if (!session) 
  {
    navigate("/");
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  console.log("PROFILE:", data);
  console.log("PROFILE ERROR:", error);

  if (data)
     {
        if (data.role === "employee")
        {
          navigate("/employee");
        }
        else if (data.role === "manager")
        {
          navigate("/manager");
        }
        else if (data.role === "admin")
        {
          navigate("/admin");
        }
     }
 }

 async function handleLogout() 
 {
  await supabase.auth.signOut();

  showToast("Logged out successfully!", "success");

  navigate("/");
 }

  return (
    <div>
      <h2>Loading...</h2>
    </div>
  );
}

export default Dashboard;