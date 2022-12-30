import './ChatPreview.css'

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
  return ''
}

export default function Chat(props) {
  const { id, usersId, usersName, message, date, setActiveChat, selected } =
    props
  const processedMessage = message
  const processedDate = calculateDate(date)

  function openThisChat() {
    const chatObj = {
      id,
    }
    setActiveChat(chatObj)
  }

  const selectedClassName = selected ? 'chat-preview-active' : ''

  return (
    <li className={'chat ' + selectedClassName} onClick={openThisChat}>
      <div className="chat-img"></div>
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
