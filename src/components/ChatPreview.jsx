import { useState, useEffect } from 'react'
import { jwtRequest } from '../utils/my-requests'
import './ChatPreview.css'
import defaultProfileImage from '../assets/default-profile-image.png'

const url = 'http://localhost:8080'
const imageUrlPrefix =
  'https://jszmidla-chatapp.s3.eu-central-1.amazonaws.com/images/'

const newChat = 'new'
const minutesSuffix = ' min'
const hoursSuffix = ' hr'
const daysSuffix = ' day'
const weeksSuffix = ' ws'
const monthsSuffix = ' mth'
const yearsSuffix = ' yr'

function calculateDate(date) {
  if (!date) return newChat

  const now = new Date()
  const messageDate = new Date(date)
  const secondsPast = (now - messageDate) / 1000

  const timeArray = [
    secondsPast / 60, // mins
    secondsPast / 60 / 60, // hours
    secondsPast / 60 / 60 / 24, // days
    secondsPast / 60 / 60 / 24 / 7, // weeks
    secondsPast / 60 / 60 / 24 / 30, // months
    secondsPast / 60 / 60 / 24 / 365, // years
  ].map((x) => Math.floor(x))
  const timeSuffixArray = [
    minutesSuffix,
    hoursSuffix,
    daysSuffix,
    weeksSuffix,
    monthsSuffix,
    yearsSuffix,
  ]

  for (let i = timeArray.length - 1; i >= 0; i--) {
    const xPassed = timeArray[i]
    const suffix = timeSuffixArray[i]
    if (xPassed >= 1) {
      if (xPassed == 1) return xPassed + suffix
      else return xPassed + suffix + 's'
    }
  }
  return 'now'
}

export default function ChatPreview(props) {
  const { chat, setActiveChat, selected } = props
  const { id, usersName, usersImageUrl, message, date } = chat
  const [image, setImage] = useState(null)
  const processedMessage = message
  const processedDate = calculateDate(date)

  let imageSource = defaultProfileImage
  if (usersImageUrl) imageSource = imageUrlPrefix + usersImageUrl

  function openThisChat() {
    setActiveChat(chat)
  }

  const selectedClassName = selected ? 'chat-preview-active' : ''

  return (
    <li className={'chat ' + selectedClassName} onClick={openThisChat}>
      <img className="chat-img" src={imageSource} />
      <div className="chat-info">
        <h5 className="chat-name">{usersName}</h5>
        <div className="chat-messagebox row">
          <p className="chat-messagebox-date col-4">{processedDate}</p>
          <p className="chat-messagebox-message col">{processedMessage}</p>
        </div>
      </div>
    </li>
  )
}
