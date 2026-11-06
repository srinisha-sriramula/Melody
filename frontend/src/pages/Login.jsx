import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Music2, Headphones, Mic2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const result = await login({ ...formData, role });
      navigate(result.user.role === "artist" ? "/artist-dashboard" : "/");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1><Music2 /> Melody</h1>
        <h2>Welcome Back!</h2>
        <p>Choose how you want to use Melody.</p>

        <div className="role-choice">
          <button type="button" className={role === "user" ? "role-choice-card selected" : "role-choice-card"} onClick={() => setRole("user")}>
            <Headphones size={22} />
            <strong>Listen as User</strong>
            <small>Listen to songs and explore albums</small>
          </button>
          <button type="button" className={role === "artist" ? "role-choice-card selected" : "role-choice-card"} onClick={() => setRole("artist")}>
            <Mic2 size={22} />
            <strong>Login as Artist</strong>
            <small>Upload songs and create albums</small>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email or Username</label>
          <input type="text" name="email" placeholder="Enter email or username" value={formData.email} onChange={handleChange} required />
          <label>Password</label>
          <input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
          <button type="submit" disabled={loading}>{loading ? "Logging in..." : `Login as ${role === "artist" ? "Artist" : "User"}`}</button>
        </form>

        {message && <p className="auth-message">{message}</p>}
        <p className="auth-link">Don't have an account? <Link to="/register"> Register</Link></p>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    </div>
  );
}

export default Login;
