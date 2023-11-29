import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as client from "./client";

function Signin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signin = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Username and password are required");
      return;
    }
    try {
      const response = await client.signin(credentials);
      if (response) {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h1>Signin</h1>
      {error && <div className="error-message">{error}</div>}
      <input
        value={credentials.username}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
      />
      <input
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
      />
      <button onClick={signin}>Signin</button>
    </div>
  );
}

export default Signin;
