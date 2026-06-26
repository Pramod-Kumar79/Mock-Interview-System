import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const serverURL = process.env.REACT_APP_SERVER_URL;

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${serverURL}/api/signup`, {
        name,
        email,
        password,
      });

      alert("Account Created");
      navigate("/login");
    } catch (err) {
      alert("Signup Failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Sign Up</h2>

      <form onSubmit={handleSignup}>
        <input
          className="form-control mb-3"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-control mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control mb-3"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#555",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button className="btn btn-success">Sign Up</button>
      </form>

      <p className="mt-3">
        Already have an account?
        <Link to="/login"> Login</Link>
      </p>
    </div>
  );
}

export default SignupPage;
