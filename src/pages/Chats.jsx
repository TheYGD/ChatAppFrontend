import { useContext, useEffect, useRef, useState } from 'react'
import { jwtRequest } from '../utils/my-requests'
import './Chats.css'
import ChatPreview from '../components/ChatPreview'
import ActiveChat from '../components/ActiveChat'
import Loading from '../components/Loading'
import CreateChatElement from '../components/CreateChatElement'
import { AppContext } from '../components/AppWithNavbarAndConnection'
import { NotificationContext } from '../App'
import { Notification } from '../classes/Notification'
import { config } from '../config/app-config'

const url = config.backendUrl
const chatsUrl = url + '/api/chats'
const usersActiveStatusesUrl = url + '/api/users-active-status'
const loadingIconHeight = 56

export default function Chats() {
  const {
    chats,
    setChats,
    loadingChatsInProgress,
    setLoadingChatsInProgress,
    lastChat,
    setLastChat,
    loadedAllChats,
    setLoadedAllChats,
  } = useContext(AppContext)
  const { updatePageWithMessageFromWSRef } = useContext(AppContext)
  const { pushNotification } = useContext(NotificationContext)
  const [activeChat, setActiveChat] = useState(null)
  const chatsEl = useRef(null)
  const updateChatAndNewMessageFromWSRef = useRef()

  useEffect(() => {
    updatePageWithMessageFromWSRef.current = (chatAndMessage) =>
      updatePageWithMessageFromWS(
        chatAndMessage,
        setActiveChat,
        updateChatAndNewMessageFromWSRef.current
      )

    return () => {
      updatePageWithMessageFromWSRef.current = null
    }
  }, [])

  useEffect(() => {
    if (chats?.length == 0) return

    const updateUsersStatusesTimout = setTimeout(
      async () => updateUsersStatuses(chats, setChats, pushNotification),
      60 * 1000
    )

    return () => {
      clearTimeout(updateUsersStatusesTimout)
    }
  }, [chats])

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
      !loadingChatsInProgress
    ) {
      setLoadingChatsInProgress(true)
      await loadChats(
        setChats,
        lastChat,
        setLastChat,
        setLoadedAllChats,
        setLoadingChatsInProgress,
        pushNotification
      )
    }
  }

  return (
    <div className="container">
      <div className="row chats">
        <div className="col-4">
          <div
            ref={chatsEl}
            className="chat-list"
            onScroll={() => onScrollChats()}
          >
            <CreateChatElement />
            {chats.map((chat) => (
              <ChatPreview
                selected={activeChat?.id === chat.id}
                key={chat.id}
                chat={chat}
                setActiveChat={setActiveChat}
              />
            ))}
            {loadingChatsInProgress && !loadedAllChats ? (
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
                updateChatAndNewMessageFromWSRef={
                  updateChatAndNewMessageFromWSRef
                }
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

export async function loadChats(
  setChats,
  lastChat,
  setLastChat,
  setLoadedAllChats,
  setLoadingInProgress,
  pushNotification
) {
  const params = {
    lastId: lastChat.id,
    lastDate: lastChat.lastInteractionDate?.toUTCString(),
  }
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
    .catch((err) => {
      const notification = Notification.error()
      pushNotification(notification)
    })
}

function updatePageWithMessageFromWS(
  chatAndMessage,
  setActiveChat,
  updateChatAndNewMessageFromWS
) {
  const { chat } = chatAndMessage

  // for unknown reason I can't pass activeChat because its always null, so iI have to get it this way
  setActiveChat((activeChat) => {
    if (activeChat?.id === chat.id) {
      updateChatAndNewMessageFromWS(chatAndMessage)
    }
    return activeChat
  })
}

async function updateUsersStatuses(chats, setChats, pushNotification) {
  const usersIds = chats.map((chat) => chat.usersId)
  const urlParams = new URLSearchParams(usersIds.map((id) => ['usersIds', id]))

  let newChats
  await jwtRequest
    .get(usersActiveStatusesUrl, { params: urlParams })
    .then((res) => {
      newChats = chats.map((chat) => {
        const newLastActiveDate = res.data[chat.usersId]
        return {
          ...chat,
          lastActiveDate: newLastActiveDate,
        }
      })
    })
    .catch((err) => {
      const notification = Notification.error()
      pushNotification(notification)
      newChats = chats
    })

  setChats(newChats)
}
