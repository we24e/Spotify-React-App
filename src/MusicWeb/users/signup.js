import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as client from "./client";
import "./signin.css"; // Import the same CSS as in Signin component

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
            // Handle the situation where the response is not as expected
            setError("Unexpected response from server");
        }
    } catch (err) {
        setError(err.response?.data?.message || "Signup failed");
    }
};


  return (
    <section className="d-flex justify-content-center align-items-center min-vh-100">
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
