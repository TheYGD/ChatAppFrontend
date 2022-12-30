import { useEffect, useRef, useState } from 'react'
import { jwtRequest } from '../utils/my-requests'
import './Chats.css'
import Chat from '../components/ChatPreview'
import ActiveChat from '../components/ActiveChat'
import Loading from '../components/Loading'

const url = 'http://localhost:8080'
const chatsUrl = url + '/api/chats'
const getMessageUrlFromChatId = (chatId) =>
  url + `/api/chats/${chatId}/messages`
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

async function loadMessagesFromChat(
  chatId,
  setMessages,
  lastMessageId,
  setLastMessageId,
  setLoadedAllMessages
) {
  const params = { lastMessageId }
  await jwtRequest
    .get(getMessageUrlFromChatId(chatId), {
      params: params,
    })
    .then((res) => {
      const newMessages = res.data
      // all messages loaded?
      if (newMessages.length == 0) {
        setLoadedAllMessages(true)
        return
      }
      setMessages((prevMessages) => [...newMessages, ...prevMessages])
      setLastMessageId(newMessages[0].id)
    })
}

export default function Chats() {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [lastChat, setLastChat] = useState({})
  const [loadingInProgress, setLoadingInProgress] = useState(false)
  const [loadedAllChats, setLoadedAllChats] = useState(false)
  const chatsEl = useRef(null)
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

  async function onScrollChats() {
    console.log(chatsEl.current)
    console.log('scrollTop', chatsEl.current.scrollTop)
    console.log('scrollHeight', chatsEl.current.scrollHeight)
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
      console.log('scrollTop', chatsEl.current.scrollTop)
      console.log('scrollHeight', chatsEl.current.scrollHeight)
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

  return (
    <div className="container ">
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
                {...chat}
                setActiveChat={setActiveChat}
              />
            ))}
            {!loadedAllChats ? (
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
                {...activeChat}
                loadMessages={loadMessagesFromChat}
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
