import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as client from "./client";
import "./signin.css";
import '../randomCss/galaxy.scss';

function Signup() {
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(true);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const signup = async () => {
    try {
      const response = await client.signup(credentials);
      if (response && response.message === "User created successfully") {
        navigate("/profile");
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };


  return (
    <section className="d-flex justify-content-center align-items-center min-vh-100">
      <div class="animation-wrapper">
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
      </div>
      <span></span>
      <div className="signin">
        <div className="content">
          <h2 className="text-center">Register</h2>
          <div className="form">
            {error && <div className="error-message">{error}</div>}
            <div className="inputBox">
              <input
                type="text"
                required
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    username: e.target.value,
                  })
                }
              />
              <i>Username</i>
            </div>
            <div className="inputBox">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    password: e.target.value,
                  })
                }
              />
              <i>Password</i>
            </div>
            <div className="inputBox">
              <input
                type="submit"
                value="Register"
                onClick={signup}
                className="btn btn-success btn-block"
              />
            </div>
            <p className="text-center no-underline">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;
