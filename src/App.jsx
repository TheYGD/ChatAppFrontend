import { createContext, useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Chats from './pages/Chats'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Logout from './pages/Logout'
import { jwtRequestNoCatch } from './utils/my-requests'
import { removeJwt } from './utils/jwt-util'

export const AppContext = createContext()

const url = 'http://localhost:8080'
const urlGetUsername = url + '/api/get-username'

function App() {
  const [username, setUsername] = useState('')
  const [jwt, setJwt] = useState('')
  const appContextValue = {
    username,
    setUsername,
    jwt,
    setJwt,
  }

  useEffect(() => {
    loadUsernameIfLoggedIn()

    function loadUsernameIfLoggedIn() {
      if (localStorage.jwt) {
        setJwt(localStorage.jwt)
        jwtRequestNoCatch
          .get(urlGetUsername)
          .then((res) => {
            if (res.status === 200) setUsername(res.data)
          })
          .catch((err) => {
            if (err.response.status === 401) removeJwt(setJwt, setUsername)
          })
      }
    }
  }, [])

  return (
    <AppContext.Provider value={appContextValue}>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Chats />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>
    </AppContext.Provider>
  )
}

export default App
