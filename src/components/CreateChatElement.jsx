import './CreateChatElement.css'
import plusIcon from '../assets/plus-icon.png'
import { useNavigate } from 'react-router-dom'

export default function CreateChatElement(props) {
  const navigate = useNavigate()

  return (
    <li className="create-chat">
      <div
        className="create-chat-clickable"
        onClick={() => navigate('/create-chat ')}
      >
        <img className="create-chat-img" src={plusIcon} />
        <h6 className="create-chat-title">Create chat</h6>
      </div>
    </li>
  )
}
