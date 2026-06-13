import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function EmployeeDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    checkRole();
  }, []);

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
    </div>
  );
}

export default EmployeeDashboard;