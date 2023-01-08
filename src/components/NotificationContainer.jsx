import './NotificationContainer.css'

const NOTIFICATION_ALIVE_TIME_SEC = 3

function Notification(props) {
  const { type, message } = props
  return <p className={'notification ' + type.notificationClass}>{message}</p>
}

export default function NotificationContainer(props) {
  const { notifications } = props

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} />
      ))}
    </div>
  )
}

export function addNotification(setNotifications, newNotification) {
  setNotifications((prevNotifications) => {
    const { id, kind } = newNotification
    function removeNotification() {
      setNotifications((prevNotifications) => {
        return prevNotifications.filter(
          (notification) => notification.id !== id
        )
      })
    }

    const newNotificationArray = [
      newNotification,
      ...prevNotifications.filter((notification) => notification.kind !== kind),
    ]

    setTimeout(removeNotification, NOTIFICATION_ALIVE_TIME_SEC * 1000)

    return newNotificationArray
  })
}
