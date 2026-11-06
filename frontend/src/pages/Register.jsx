import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Music2, Headphones, Mic2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const result = await register({ ...formData, role });
      navigate(result.user.role === "artist" ? "/artist-dashboard" : "/");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1><Music2 /> Melody</h1>
        <h2>Create Account</h2>
        <p>Choose your Melody account type.</p>

        <div className="role-choice">
          <button type="button" className={role === "user" ? "role-choice-card selected" : "role-choice-card"} onClick={() => setRole("user")}>
            <Headphones size={22} />
            <strong>User</strong>
            <small>Listen to music</small>
          </button>
          <button type="button" className={role === "artist" ? "role-choice-card selected" : "role-choice-card"} onClick={() => setRole("artist")}>
            <Mic2 size={22} />
            <strong>Artist</strong>
            <small>Upload your music</small>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" name="username" placeholder="Enter username" value={formData.username} onChange={handleChange} required />
          <label>Email</label>
          <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
          <label>Password</label>
          <input type="password" name="password" placeholder="Create password" value={formData.password} onChange={handleChange} minLength={8} required />
          <button type="submit" disabled={loading}>{loading ? "Creating Account..." : `Register as ${role === "artist" ? "Artist" : "User"}`}</button>
        </form>

        {message && <p className="auth-message">{message}</p>}
        <p className="auth-link">Already have an account? <Link to="/login"> Login</Link></p>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    </div>
  );
}

export default Register;
