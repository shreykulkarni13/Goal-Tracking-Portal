import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function Dashboard() 
{
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

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

  if (data) {
    setProfile(data);
  }
 }

 async function handleLogout() 
 {
  await supabase.auth.signOut();

  alert("Logged out successfully!");

  navigate("/");
 }

  return (
    <div>
      <h1>Dashboard</h1>

      {profile && (
     <div>
       <h2>Welcome {profile.full_name}</h2>

       <p>Email: {profile.email}</p>

       <p>Role: {profile.role}</p>

       <p>Department: {profile.department}</p>
     </div>
       )}

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;