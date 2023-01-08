import './ChatPreview.css'
import defaultProfileImage from '../assets/default-profile-image.png'

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

function createActiveStatusBadge(lastActive) {
  if (!lastActive) return <i className="chat-active-badge"></i>

  const lastActiveDate = new Date(lastActive)
  const minutesFromNow = Math.floor((new Date() - lastActiveDate) / (60 * 1000))
  const hoursFromNow = Math.floor(minutesFromNow / 60)

  // if its more than 24 full hours - long time ago
  let timeAgo
  if (hoursFromNow > 24) return <></>
  if (hoursFromNow >= 1)
    timeAgo = hoursFromNow + ' ' + hoursSuffix + (hoursFromNow != 1 ? 's' : '')
  else if (minutesFromNow > 1)
    timeAgo = minutesFromNow + ' ' + minutesSuffix + 's'
  else timeAgo = 1 + ' ' + minutesSuffix

  return <i className="chat-inactive-badge">{timeAgo}</i>
}

export default function ChatPreview(props) {
  const { chat, setActiveChat, selected } = props
  const {
    id,
    usersName,
    usersImageUrl,
    message,
    lastInteractionDate,
    lastActiveDate,
    lastReadMessageIdByOther,
    lastReadMessageIdByThis,
  } = chat
  const processedMessage = message
  const processedDate = calculateDate(lastInteractionDate)

  let imageSource = defaultProfileImage
  if (usersImageUrl) imageSource = imageUrlPrefix + usersImageUrl

  function openThisChat() {
    setActiveChat(chat)
  }

  const selectedClassName = selected ? 'chat-preview-active' : ''
  const activeStatusBadge = createActiveStatusBadge(lastActiveDate)
  const isUnread = lastReadMessageIdByThis < lastReadMessageIdByOther
  const showMessage = message

  return (
    <li className={'chat ' + selectedClassName} onClick={openThisChat}>
      <div className="chat-img-box">
        <img className="chat-img" src={imageSource} />
        {activeStatusBadge}
      </div>
      <div className="chat-info">
        <h5 className="chat-name">{usersName}</h5>
        <div className="chat-messagebox row">
          <p className="chat-messagebox-date col-4">{processedDate}</p>
          <p
            className={
              'chat-messagebox-message col ' + (isUnread ? 'fw-bold' : '')
            }
          >
            {processedMessage}
          </p>
        </div>
      </div>
      {isUnread && <i className="chat-unread-icon"></i>}
    </li>
  )
}
