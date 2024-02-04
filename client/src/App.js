import './App.css';
import React, { useEffect, useState } from 'react';
import Axios from 'axios';

function App() {
  const [usernameReg, setUsernameReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [usernameLog, setUsernameLog] = useState('');
  const [passwordLog, setPasswordLog] = useState('');
  const [loginStatus, setLoginStatus] = useState(false);


  Axios.defaults.withCredentials = true

  const register = () => {
    Axios.post('http://localhost:8081/register', {
      username: usernameReg,
      password: passwordReg,
    }).then((response) => {
      console.log(response)
    });
  }



  const login = () => {
    Axios.post('http://localhost:8081/login',
      { username: usernameLog, password: passwordLog })
      .then((response) => {
        console.log(response.data.result[0]);
        if (!response.data.auth) {
          setLoginStatus(false)
        } else {
          // console.log(response.data);
          localStorage.setItem("token", response.data.token)
          setLoginStatus(true)
          // setLoginStatus(`User ID: ${response.data.result[0].id}, Username: ${response.data.result[0].username}`);

        }

      })

  }


  useEffect(() => {
    Axios.get("http://localhost:8081/login").then((response) => {
      console.log(response);
      if (response.data.loggedIn === true)
        setLoginStatus(response.data.user[0].username)
    })
  }, [])

  const userAuthenticated = () => {
    Axios.get("http://localhost:8081/isUserAuth", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      }
    }).then((response) => {
      console.log(response)
    })
  }

  return (
    <div className="App">
      <div className="registration">
        <h1>Registration</h1>
        <label htmlFor="">Username</label><br />
        <input type="text" onChange={(e) => { setUsernameReg(e.target.value) }} /><br />
        <label htmlFor="">Password</label><br />
        <input type="text" onChange={(e) => { setPasswordReg(e.target.value) }} /><br />
        <button onClick={register}>Register</button>
      </div>
      <div className="login">
        <h1>Login</h1>
        <input type="text" placeholder="Username..."
          onChange={(e) => setUsernameLog(e.target.value)} /><br />
        <input type="password" placeholder="Password..."
          onChange={(e) => setPasswordLog(e.target.value)} /><br />
        <button onClick={login}> Login </button>


      </div>
      {loginStatus &&
        <button onClick={userAuthenticated}>Check if Authenticated</button>
      }
    </div>
  );
}

export default App;
