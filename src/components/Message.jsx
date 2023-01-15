import './Message.css'
import { useRef, useEffect } from 'react'
import defaultProfileImage from '../assets/default-profile-image.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons'

const imageUrlPrefix =
  'https://jszmidla-chatapp.s3.eu-central-1.amazonaws.com/images/'

export default function Message(props) {
  const {
    otherUsersImageUrl,
    message,
    markMessageAsReadTimoutRef,
    lastReadByThisId,
    lastReadByOtherId,
    changeLastReadMessageOnTheServer,
  } = props
  const { id, content, date, sent, text: isText } = message
  const processedDate = processMessageDate(date)
  const side = sent ? 'right' : 'left'
  const contentP = useRef(null)

  let imageSource = defaultProfileImage
  if (otherUsersImageUrl) imageSource = imageUrlPrefix + otherUsersImageUrl

  useEffect(() => {
    if (
      lastReadByThisId < id &&
      (!markMessageAsReadTimoutRef.current ||
        markMessageAsReadTimoutRef.current.id < id)
    ) {
      if (markMessageAsReadTimoutRef.current)
        clearTimeout(markMessageAsReadTimoutRef.current.timeout)
      const markAsReadTimeoutObject = {
        id: id,
        timeout: setTimeout(
          () => changeLastReadMessageOnTheServer(message),
          200
        ),
      }
      markMessageAsReadTimoutRef.current = markAsReadTimeoutObject
    }
  }, [])

  return (
    <div className={'col-6 message-' + side}>
      {isText ? (
        <p ref={contentP} className="message-content">
          {content}
        </p>
      ) : (
        <File name={content} />
      )}
      <p className="message-date">{processedDate}</p>
      {lastReadByOtherId == id && (
        <div className="message-read-image-box">
          <img src={imageSource} className="message-read-image" />
        </div>
      )}
    </div>
  )
}

function processMessageDate(date) {
  const now = new Date()
  const messageDate = new Date(date + 'Z')

  // same day, show just time
  if (
    now.getDate() === messageDate.getDate() &&
    now.getMonth() === messageDate.getMonth() &&
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

function File(props) {
  const { name } = props
  const extension = name.substring(name.lastIndexOf('.') + 1)
  const url = imageUrlPrefix + name

  const isImage = ['png', 'svg', 'jpg', 'jpeg', 'gif', 'bmp'].includes(
    extension
  )

  return isImage ? (
    <img className="message-image" src={url} />
  ) : (
    <div className="message-file">
      <FontAwesomeIcon className="message-file-icon" icon={faFile} />
      <a href={url}>{name}</a>
    </div>
  )
}
