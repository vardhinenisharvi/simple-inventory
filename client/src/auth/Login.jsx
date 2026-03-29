import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [l, setL] = useState({
    email: "",
    password: "",
  });

  const api = "http://localhost:4040/api/auth/login";
  const navigate = useNavigate();

  async function submitHandler() {
    if (!l.email || !l.password) {
      alert("Email and password required ❌");
      return;
    }

    console.log("Login request:", l);

    try {
      const res = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(l),
      });

      const data = await res.json();
      console.log("API response:", data);

      if (!res.ok) {
        alert(data.message || "Invalid credentials ❌");
        return;
      }

      // ✅ STORE JWT TOKEN CORRECTLY
      localStorage.setItem("token", data.token);

      alert("Login success ✅");
      navigate("/admin");

    } catch (err) {
      console.error("Login error:", err);
      alert("Server not reachable ❌");
    }
  }

  return (
    <div className="stack-center">
      <div className="glass-card pad" style={{ width: 360, maxWidth: '92vw' }}>
        <h3 className="glass-title">Login</h3>
        <p className="glass-subtle">Enter your credentials to continue</p>
        <div style={{ height: 12 }} />
        <input
          className="glass-input"
          type="email"
          placeholder="Email"
          value={l.email}
          onChange={(e) => setL({ ...l, email: e.target.value })}
        />
        <div style={{ height: 12 }} />
        <input
          className="glass-input"
          type="password"
          placeholder="Password"
          value={l.password}
          onChange={(e) => setL({ ...l, password: e.target.value })}
        />
        <div style={{ height: 16 }} />
        <div className="glass-row">
          <button className="glass-btn primary" onClick={submitHandler}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
