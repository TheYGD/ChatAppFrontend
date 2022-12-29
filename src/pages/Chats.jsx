import { useEffect, useState } from 'react'
import { jwtRequest } from '../utils/my-requests'
import Chat from '../components/ChatPreview'
import ActiveChat from '../components/ActiveChat'
import './Chats.css'

const url = 'http://localhost:8080'
const chatsUrl = url + '/api/chats'

async function loadChats(setChats) {
  const params = { lastId: -2, lastDate: '2222-12-12T19:19:00' } // todo change
  const chats = await jwtRequest
    .get(chatsUrl, {
      params: params,
    })
    .then((res) => {
      return res.data.content
    })
  setChats(chats)
}

export default function Home() {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  useEffect(() => {
    loadChats(setChats)
  }, [])

  return (
    <div className="container ">
      <div className="row mt-5 chats">
        <div className="col-4">
          <div className="chat-list">
            {chats.map((chat) => (
              <Chat key={chat.id} {...chat} setActiveChat={setActiveChat} />
            ))}
          </div>
        </div>
        <div className="col-8">
          <div className="active-chat">
            {activeChat ? (
              <ActiveChat />
            ) : (
              <h3 className="py-5 text-center">Click on a chat to open it</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
