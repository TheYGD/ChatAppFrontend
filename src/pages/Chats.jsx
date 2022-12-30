import { useContext, useEffect, useRef, useState } from 'react'
import { jwtRequest } from '../utils/my-requests'
import './Chats.css'
import Chat from '../components/ChatPreview'
import ActiveChat from '../components/ActiveChat'
import Loading from '../components/Loading'
import { AppContext } from '../App'
import SockJS from 'sockjs-client/dist/sockjs'
import Stomp from 'stompjs'

const url = 'http://localhost:8080'
const chatsUrl = url + '/api/chats'
const getMessageUrlFromChatId = (chatId) =>
  url + `/api/chats/${chatId}/messages`
const websocketUrl = url + '/ws/chats'
const loadingIconHeight = 56

async function loadChats(
  setChats,
  lastChat,
  setLastChat,
  setLoadedAllChats,
  setLoadingInProgress
) {
  const params = { lastId: lastChat.id, lastDate: lastChat.date } // todo change
  await jwtRequest
    .get(chatsUrl, {
      params: params,
    })
    .then((res) => {
      const newChats = res.data
      // all loaded
      if (newChats.length == 0) {
        setLoadedAllChats(true)
        return
      }
      setChats((prevChats) => [...prevChats, ...newChats])
      setLastChat(newChats[newChats.length - 1])
      setLoadingInProgress(false)
    })
}

async function sendMessage(chat, content, setContent) {
  const params = { content }
  await jwtRequest
    .post(
      getMessageUrlFromChatId(chat.id),
      {},
      {
        params: params,
      }
    )
    .then((res) => {
      setContent('')
    })
    .catch((err) => {
      console.log(err)
      console.error('error: message not sent')
    })
}

async function loadMessagesFromChat(
  chat,
  setMessages,
  lastMessageId,
  setLastMessageId,
  setLoadedAllMessages
) {
  const params = { lastMessageId }
  await jwtRequest
    .get(getMessageUrlFromChatId(chat.id), {
      params: params,
    })
    .then((res) => {
      const newMessages = res.data
      // all messages loaded?
      if (!chat.firstMessageId || chat.firstMessageId === newMessages[0].id) {
        setLoadedAllMessages(true)
        if (newMessages.length === 0) return
      }
      setMessages((prevMessages) => [...newMessages, ...prevMessages])
      setLastMessageId(newMessages[0].id)
    })
}

function updatePageWithMessageFromWS(
  chatAndMessage,
  setChats,
  setActiveChat,
  setMessages,
  scrollDownTheMessagesRef
) {
  const { chat, message } = chatAndMessage

  setChats((prevChats) => {
    return [chat, ...prevChats.filter((prevChat) => prevChat.id !== chat.id)]
  })

  // for unknown reason I can't pass activeChat because its always null, so iI have to get it this way
  setActiveChat((activeChat) => {
    if (activeChat?.id === chat.id) {
      setMessages((prevMessages) => [...prevMessages, message])
      setTimeout(() => scrollDownTheMessagesRef.current(), 1)
    }
    return activeChat
  })
}

export default function Chats() {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [lastChat, setLastChat] = useState({})
  const [loadingInProgress, setLoadingInProgress] = useState(false)
  const [loadedAllChats, setLoadedAllChats] = useState(false)
  const [messages, setMessages] = useState([])
  const chatsEl = useRef(null)
  const { username } = useContext(AppContext)
  useEffect(() => {
    setLoadingInProgress(true)
    loadChats(
      setChats,
      lastChat,
      setLastChat,
      setLoadedAllChats,
      setLoadingInProgress
    )
  }, [])

  useEffect(() => {
    if (username === '') return
    const socket = new SockJS(websocketUrl)
    const stompClient = Stomp.over(socket)
    stompClient.connect({}, function (frame) {
      stompClient.subscribe('/topic/users/' + username, function (frame) {
        const chatAndMessage = JSON.parse(frame.body)
        updatePageWithMessageFromWS(
          chatAndMessage,
          setChats,
          setActiveChat,
          setMessages,
          scrollDownTheMessagesRef
        )
      })
    })
    return () => {
      console.log('effect removed')
      stompClient.disconnect()
    }
  }, [username])

  async function onScrollChats() {
    const current = chatsEl.current
    if (
      current.scrollHeight -
        current.scrollTop -
        current.offsetHeight -
        loadingIconHeight +
        16 <
        0 &&
      !loadedAllChats &&
      !loadingInProgress
    ) {
      setLoadingInProgress(true)
      await loadChats(
        setChats,
        lastChat,
        setLastChat,
        setLoadedAllChats,
        setLoadingInProgress
      )
    }
  }

  const scrollDownTheMessagesRef = useRef(null)

  return (
    <div className="container">
      <div className="row mt-5 chats">
        <div className="col-4">
          <div
            ref={chatsEl}
            className="chat-list"
            onScroll={() => onScrollChats()}
          >
            {chats.map((chat) => (
              <Chat
                selected={activeChat?.id === chat.id}
                key={chat.id}
                chat={chat}
                setActiveChat={setActiveChat}
              />
            ))}
            {loadingInProgress && !loadedAllChats ? (
              <li>
                <Loading />
              </li>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="col-8">
          <div className="active-chat">
            {activeChat ? (
              <ActiveChat
                key={activeChat.id}
                chat={activeChat}
                messages={messages}
                setMessages={setMessages}
                loadMessages={loadMessagesFromChat}
                sendMessage={sendMessage}
                scrollDownTheMessagesRef={scrollDownTheMessagesRef}
              />
            ) : (
              <h3 className="py-5 text-center">Click on a chat to open it</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
