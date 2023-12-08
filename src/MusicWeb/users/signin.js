import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as client from "./client";
import "./signin.css";
import '../randomCss/galaxy.scss';

function Signin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signin = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Username and Password are required!");
      return;
    }
    try {
      const response = await client.signin(credentials);
      if (response) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', credentials.username);
        navigate("/profile");
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleSignupClick = () => {
    navigate("/signup");
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
          <h2 className="text-center">Sign In</h2>
          <div className="form">
            {error && <div className="error-message">{error}</div>}
            <div className="inputBox">
              <input
                type="text"
                required
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
              />
              <i>Username</i>
            </div>
            <div className="inputBox">
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
              <i>Password</i>
            </div>
            <div className="links d-flex justify-content-between align-items-center">
              <a href="#" onClick={handleSignupClick} className="text-center">
                Signup Here!
              </a>
            </div>
            <div className="inputBox">
              <input
                type="submit"
                value="Login"
                onClick={signin}
                className="btn btn-success btn-block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signin;
