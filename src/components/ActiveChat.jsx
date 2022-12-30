import { useEffect, useRef, useState } from 'react'
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
      <p className={'px-4 my-0 message-date-' + side}>{processedDate}</p>
    </>
  )
}

export default function ActiveChat(props) {
  const { id, loadMessages } = props
  const [messages, setMessages] = useState([])
  const [lastMessageId, setLastMessageId] = useState(null)
  const [loadedAllMessages, setLoadedAllMessages] = useState(false)
  const chatViewEl = useRef(null)

  useEffect(() => {
    loadMessages(
      id,
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

  async function onScrollChatView() {
    if (chatViewEl.current.scrollTop == 0 && !loadedAllMessages) {
      const scrollHeightBefore = chatViewEl.current.scrollHeight
      await loadMessages(
        id,
        setMessages,
        lastMessageId,
        setLastMessageId,
        setLoadedAllMessages
      )
      setTimeout(() => {
        chatViewEl.current.scrollTop =
          chatViewEl.current.scrollHeight - scrollHeightBefore
        console.log(chatViewEl.current.scrollTop)
      }, 1)
    }
  }

  return (
    <>
      <div
        ref={chatViewEl}
        className="overflow-auto d-flex flex-column py-4 px-3 h-100"
        onScroll={() => onScrollChatView()}
      >
        {loadedAllMessages ? (
          <h5 className="text-center">Beginning of the chat</h5>
        ) : (
          <></>
        )}
        {messages.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </div>
      <div className="row mx-2 mt-3">
        <textarea
          className="col rounded-2 p-1 px-2"
          style={{ height: '5rem', resize: 'none' }}
        ></textarea>
        <button type="button" className="btn btn-primary col-1 ms-4 my-auto">
          Send
        </button>
      </div>
    </>
  )
}
