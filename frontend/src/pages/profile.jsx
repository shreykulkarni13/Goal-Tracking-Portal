import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      alert(profileError.message);
      return;
    }

    setProfile(profileData);

    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", session.user.id);

    if (goalsError) {
      console.log(goalsError);
      return;
    }

    setGoals(goalsData);
  }

  if (!profile) {
    return <p>Loading Profile...</p>;
  }

  const pendingGoals = goals.filter((goal) => goal.status === "pending");
  const approvedGoals = goals.filter((goal) => goal.status === "approved");
  const rejectedGoals = goals.filter((goal) => goal.status === "rejected");
  const completedGoals = goals.filter((goal) => goal.status === "completed");

  return (
    <div>
      <h1>Profile</h1>

      <h2>Personal Information</h2>

      <p><strong>Name:</strong> {profile.full_name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      <p><strong>Department:</strong> {profile.department}</p>
      <p><strong>Approval Status:</strong> {profile.approval_status}</p>
      <p>
        <strong>Joined Date:</strong>{" "}
        {new Date(profile.created_at).toLocaleDateString()}
      </p>

      <h2>Goal Statistics</h2>

      <p>Total Goals: {goals.length}</p>
      <p>Pending Goals: {pendingGoals.length}</p>
      <p>Approved Goals: {approvedGoals.length}</p>
      <p>Rejected Goals: {rejectedGoals.length}</p>
      <p>Completed Goals: {completedGoals.length}</p>

      <button
        onClick={() => {
          if (profile.role === "employee") {
            navigate("/employee");
          } else if (profile.role === "manager") {
            navigate("/manager");
          } else if (profile.role === "admin") {
            navigate("/admin");
          }
        }}
      >
        Back to Dashboard
      </button>

      <br />
      <br />

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

export default Profile;