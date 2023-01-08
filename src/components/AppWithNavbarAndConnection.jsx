import Navbar from './Navbar'
import { useState, useEffect, useRef, createContext } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { loadChats } from '../pages/Chats'
import { StompService } from '../classes/StompService'
import { jwtRequest } from '../utils/my-requests'

const url = 'http://localhost:8080'
const getUsernameUrl = url + '/api/get-username'
const websocketUrl = url + '/ws/chats'

export const AppContext = createContext()

export default function AppWithNavbarAndConnection() {
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
      <div className="app">
        <Navbar />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </AppContext.Provider>
  )
}

function loadUsernameIfHasJwt(appContextValue, getUsernameUrl, navigate) {
  const { setJwt, setUsername } = appContextValue
  const jwt = localStorage.jwt

  console.log('hehe')
  if (jwt) {
    setJwt(jwt)
    jwtRequest.get(getUsernameUrl).then((res) => {
      if (res.status === 200) setUsername(res.data)
    })
  } else {
    navigate('/login')
  }
}
