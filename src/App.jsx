import { createContext, useState, useEffect, useRef } from 'react'
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom'
import './App.css'
import Chats from './pages/Chats'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Logout from './pages/Logout'
import CreateChat from './pages/CreateChat'
import { jwtRequest } from './utils/my-requests'
import OwnProfile from './pages/OwnProfile'
import { loadChats } from './pages/Chats'
import { StompService } from './classes/StompService'

export const AppContext = createContext()

const url = 'http://localhost:8080'
const getUsernameUrl = url + '/api/get-username'
const websocketUrl = url + '/ws/chats'

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
    <div className="app-content-center">
      <Outlet />
    </div>
  )
}

export default function App() {
  const [username, setUsername] = useState('')
  const [jwt, setJwt] = useState('')
  const [chats, setChats] = useState([])
  const [loadingChatsInProgress, setLoadingChatsInProgress] = useState(false)
  const [lastChat, setLastChat] = useState({})
  const [loadedAllChats, setLoadedAllChats] = useState(false)
  const updatePageWithMessageFromWSRef = useRef()
  const appContextValue = {
    username,
    setUsername,
    jwt,
    setJwt,
    chats,
    setChats,
    updatePageWithMessageFromWSRef,
    loadingChatsInProgress,
    setLoadingChatsInProgress,
    lastChat,
    setLastChat,
    loadedAllChats,
    setLoadedAllChats,
  }
  const [stompService, setStompService] = useState()
  const navigate = useNavigate()

  useEffect(() => {
    loadUsernameIfHasJwt(appContextValue, getUsernameUrl, navigate)
  }, [])

  useEffect(() => {
    if (!username) return

    setStompService(
      new StompService(appContextValue, handleMessageFromWS, websocketUrl)
    )
  }, [username])

  useEffect(() => {
    if (!stompService) return

    stompService.establishStompConnection()
    setLoadingChatsInProgress(true)
    loadChats(
      setChats,
      {},
      setLastChat,
      setLoadedAllChats,
      setLoadingChatsInProgress
    )

    return () => {
      stompService.closeStompConnection()
    }
  }, [stompService])

  function handleMessageFromWS(chatAndMessage) {
    const { chat, message } = chatAndMessage

    console.log(chat)
    if (message || !chat.firstMessageId) {
      setChats((prevChats) => [
        chat,
        ...prevChats.filter((prevChat) => prevChat.id !== chat.id),
      ])
    } else {
      setChats((prevChats) => [
        ...prevChats.map((prevChat) =>
          prevChat.id !== chat.id ? prevChat : chat
        ),
      ])
    }

    if (updatePageWithMessageFromWSRef.current)
      updatePageWithMessageFromWSRef.current(chatAndMessage)
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <Routes>
        <Route path="/" element={<AppWithoutNavbar />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<AppWithNavbar />}>
          <Route index element={<Chats />} />
          <Route path="/create-chat" element={<CreateChat />} />
          <Route path="/profile" element={<OwnProfile />} />
          <Route path="/logout" element={<Logout />} />
        </Route>
      </Routes>
    </AppContext.Provider>
  )
}

function loadUsernameIfHasJwt(appContextValue, getUsernameUrl, navigate) {
  const { setJwt, setUsername } = appContextValue
  const jwt = localStorage.jwt

  if (jwt) {
    setJwt(jwt)
    jwtRequest.get(getUsernameUrl).then((res) => {
      if (res.status === 200) setUsername(res.data)
    })
  } else {
    navigate('/login')
  }
}
