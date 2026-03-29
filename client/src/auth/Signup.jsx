import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  let [n, setN] = useState("test");
  let [e, setE] = useState("test@gmail.com");
  let [p, setP] = useState("password");

  let ng=useNavigate();
async  function submitHandler() {
    let objData = {
      name: n,
      email: e,
      password: p,
    };
    console.log(" object : " + JSON.stringify(objData,null,2));
    try{
      let res= await  fetch("http://localhost:4040/api/auth/signup",
        {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(objData)
      }
    )
    let dataText=await res.text();
    console.log("\n\t res = "+dataText)
    if(res.ok){
      alert(" signup sucess ...✅ ");
      ng("/login")
    }
    }catch{
      console.log("\n\t error")
    }


  }

  return (
    <div className="stack-center">
      <div className="glass-card pad" style={{ width: 380, maxWidth: '92vw' }}>
        <h3 className="glass-title">Create account</h3>
        <p className="glass-subtle">Sign up to get started</p>
        <div style={{ height: 12 }} />
        <input
          className="glass-input"
          type="text"
          placeholder="Name"
          onChange={(e) => setN(e.target.value)}
        />
        <div style={{ height: 12 }} />
        <input
          className="glass-input"
          type="email"
          placeholder="Email"
          onChange={(e) => setE(e.target.value)}
        />
        <div style={{ height: 12 }} />
        <input
          className="glass-input"
          type="password"
          placeholder="Password"
          onChange={(e) => setP(e.target.value)}
        />
        <div style={{ height: 16 }} />
        <div className="glass-row">
          <button className="glass-btn primary" onClick={submitHandler}>Sign up</button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
