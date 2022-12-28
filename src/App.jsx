import { createContext, useState, useEffect } from 'react'
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom'
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

function AppWithNavbar() {
  return (
    <>
      <Navbar />
      <div className="app-content">
        <Outlet />
      </div>
    </>
  )
}

function AppWithoutNavbar() {
  return (
    <div className="app-content">
      <Outlet />
    </div>
  )
}

function App() {
  const [username, setUsername] = useState('')
  const [jwt, setJwt] = useState('')
  const appContextValue = {
    username,
    setUsername,
    jwt,
    setJwt,
  }
  const navigate = useNavigate()

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
      } else navigate('/login')
    }
  }, [])

  return (
    <AppContext.Provider value={appContextValue}>
      <Routes>
        <Route path="/" element={<AppWithoutNavbar />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<AppWithNavbar />}>
          <Route index element={<Chats />} />
          <Route path="/logout" element={<Logout />} />
        </Route>
      </Routes>
    </AppContext.Provider>
  )
}

export default App
