import { useEffect, useRef, useState } from 'react'
import { jwtRequest } from '../utils/my-requests'
import './ActiveChat.css'

function processMessageDate(date) {
  const now = new Date()
  const messageDate = new Date(date)

  // same day, show just time
  if (
    now.getDate() === messageDate.getDate() ||
    now.getMonth() === messageDate.getMonth() ||
    now.getFullYear() === messageDate.getFullYear()
  ) {
    return messageDate.toLocaleTimeString().substring(0, 5)
  } else {
    // different day, show full date
    return (
      messageDate.toLocaleDateString() +
      ' ' +
      messageDate.toLocaleTimeString().substring(0, 5)
    )
  }
}

function Message(props) {
  const { content, date, sent } = props
  const processedDate = processMessageDate(date)
  const side = sent ? 'right' : 'left'

  return (
    <>
      <p className={'col-6 message message-' + side}>{content}</p>
      <p className={'message-date message-date-' + side}>{processedDate}</p>
    </>
  )
}

export default function ActiveChat(props) {
  const {
    chat,
    messages,
    setMessages,
    loadMessages,
    sendMessage,
    scrollDownTheMessagesRef,
  } = props
  const [lastMessageId, setLastMessageId] = useState(null)
  const [loadedAllMessages, setLoadedAllMessages] = useState(false)
  const [sendMessageContent, setSendMessageContent] = useState('')
  const [sendingInProgress, setSendingInProgress] = useState(false)
  const chatViewEl = useRef(null)

  useEffect(() => {
    scrollDownTheMessagesRef.current = scrollDownTheMessagesIfSeesMostRecent

    setMessages([])
    loadMessages(
      chat,
      setMessages,
      lastMessageId,
      setLastMessageId,
      setLoadedAllMessages
    ).then(() => {
      setTimeout(() => {
        chatViewEl.current.scrollTop = chatViewEl.current.scrollHeight
      }, 1)
    })
  }, [])

  /** Scroll only is the user sees most recent message aka scrollbar is at the lowest possible position */
  function scrollDownTheMessagesIfSeesMostRecent() {
    chatViewEl.current.scrollTop = chatViewEl.current.scrollHeight
    // todo ONLY IF ITS OUTS
  }

  async function sendMessageIfPossible() {
    if (!sendingInProgress) {
      setSendingInProgress(true)
      await sendMessage(chat, sendMessageContent, setSendMessageContent)
      setSendingInProgress(false)
    }
  }

  async function onScrollChatView() {
    if (chatViewEl.current.scrollTop == 0 && !loadedAllMessages) {
      const scrollHeightBefore = chatViewEl.current.scrollHeight
      await loadMessages(
        chat,
        setMessages,
        lastMessageId,
        setLastMessageId,
        setLoadedAllMessages
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
          <Message key={message.id} {...message} />
        ))}
      </div>
      <div className="row mx-0 mt-3">
        <textarea
          className="message-send-box col"
          style={{ height: '5rem', resize: 'none' }}
          value={sendMessageContent}
          onChange={(event) => setSendMessageContent(event.target.value)}
        ></textarea>
        <button
          className="btn message-send-btn col-1 ms-4 my-auto"
          onClick={sendMessageIfPossible}
        >
          Send
        </button>
      </div>
    </>
  )
}
