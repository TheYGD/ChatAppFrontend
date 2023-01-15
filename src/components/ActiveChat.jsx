import { useContext, useEffect, useRef, useState } from 'react'
import './ActiveChat.css'
import Message from './Message'
import { jwtRequest } from '../utils/my-requests'
import { NotificationContext } from '../App'
import { Notification } from '../classes/Notification'
import { config } from '../config/app-config'
import MessageInputBox from './MessageInputBox'

const url = config.backendUrl
const getMessageUrlFromChatId = (chatId) =>
  url + `/api/chats/${chatId}/messages`
const getMessageReadUrlFromChatId = (chatId) =>
  url + `/api/chats/${chatId}/message-read`
const imageUrlPrefix = config.awsBucketUrl + 'images/'

export default function ActiveChat(props) {
  const { updateChatAndNewMessageFromWSRef } = props
  const [messages, setMessages] = useState([])
  const [lastMessageId, setLastMessageId] = useState(null)
  const [loadedAllMessages, setLoadedAllMessages] = useState(false)
  const checkIfVisibleArrayRef = useRef([])
  const chatViewEl = useRef(null)
  // const lastReadMessageRef = useRef(0)
  const markMessageAsReadTimoutRef = useRef()
  const [chat, setChat] = useState({})
  const { pushNotification } = useContext(NotificationContext)

  useEffect(() => {
    setChat(props.chat)
    updateChatAndNewMessageFromWSRef.current = updateChatAndNewMessageFromWS

    loadMessages(
      props.chat,
      setMessages,
      lastMessageId,
      setLastMessageId,
      setLoadedAllMessages,
      pushNotification
    ).then(() => scrollDownTheMessagesIfSeesMostRecent())

    return () => {
      updateChatAndNewMessageFromWSRef.current = null
    }
  }, [])

  function updateChatAndNewMessageFromWS(chatAndMessage) {
    const { chat, message } = chatAndMessage

    setTimeout(() => setChat(chat), 0)

    if (message) {
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, message])
        scrollDownTheMessagesIfSeesMostRecent()
      }, 0)
    }
  }

  /** Scroll only is the user sees most recent message aka scrollbar is at the lowest possible position */
  function scrollDownTheMessagesIfSeesMostRecent() {
    const action = () =>
      (chatViewEl.current.scrollTop = chatViewEl.current.scrollHeight)
    setTimeout(action, 0)
    // todo ONLY IF ITS OUTS
  }

  async function sendMessageIfPossible() {
    if (!sendingInProgress) {
      setSendingInProgress(true)
      await sendMessage(
        chat,
        sendMessageContent,
        setSendMessageContent,
        pushNotification
      )
      setSendingInProgress(false)
    }
  }

  function changeLastReadMessageOnTheServer(message) {
    const params = { messageId: message.id }
    jwtRequest
      .post(getMessageReadUrlFromChatId(chat.id), {}, { params })
      .catch((err) => {
        console.error(err)
      })
  }

  async function onScrollChatView() {
    runChecksForUnreadMessages(
      chatViewEl.current,
      checkIfVisibleArrayRef.current
    )
    if (chatViewEl.current.scrollTop == 0 && !loadedAllMessages) {
      const scrollHeightBefore = chatViewEl.current.scrollHeight
      await loadMessages(
        chat,
        setMessages,
        lastMessageId,
        setLastMessageId,
        setLoadedAllMessages,
        pushNotification
      )
      setTimeout(() => {
        chatViewEl.current.scrollTop =
          chatViewEl.current.scrollHeight - scrollHeightBefore
      }, 1)
    }
  }

  return (
    <>
      <div
        ref={chatViewEl}
        className="chat-view"
        onScroll={() => onScrollChatView()}
      >
        {loadedAllMessages ? (
          <h5 className="chat-beginning text-center">Beginning of the chat</h5>
        ) : (
          <></>
        )}
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            otherUsersImageUrl={chat.usersImageUrl}
            chatId={chat.id}
            scrollViewRef={chatViewEl}
            markMessageAsReadTimoutRef={markMessageAsReadTimoutRef}
            lastReadByThisId={chat.lastReadMessageIdByThis}
            lastReadByOtherId={chat.lastReadMessageIdByOther}
            changeLastReadMessageOnTheServer={changeLastReadMessageOnTheServer}
          />
        ))}
      </div>
      <MessageInputBox chat={chat} />
    </>
  )
}

async function loadMessages(
  chat,
  setMessages,
  lastMessageId,
  setLastMessageId,
  setLoadedAllMessages,
  pushNotification
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
    .catch((err) => {
      const notification = Notification.error()
      pushNotification(notification)
    })
}

function runChecksForUnreadMessages(
  scrollView,
  checkIfVisibleArray,
  lastReadMessageIdRef,
  markMessageAsReadTimourRef
) {
  const unreadArrayFromNewest = checkIfVisibleArray.reverse()
  for (let i = unreadArrayFromNewest.length - 1; i >= 0; i--) {
    const { id, func } = unreadArrayFromNewest[i]

    if (id > lastReadMessageIdRef.current) {
      if (markMessageAsReadTimourRef.current)
        clearTimeout(markMessageAsReadTimourRef.current)
      lastReadMessageIdRef.current = id
      markMessageAsReadTimourRef.current = setTimeout(
        () => func(scrollView),
        100
      )
    }
  }
}
