import './ConfirmRegistration.css'
import { config } from '../config/app-config'
import { useState, useContext } from 'react'
import axios from 'axios'
import { NotificationContext } from '../App'
import { Notification } from '../classes/Notification'
import { Link } from 'react-router-dom'

export default function ConfirmRegistration(props) {
  const activateUrl = config.url + '/api/register/confirm'
  const { token } = props
  const [confirmed, setConfirmed] = useState(false)

  function activateAccount() {
    const params = {
      token,
    }
    console.log(activateUrl, params)
    axios
      .post(activateUrl, {}, { params })
      .then((res) => setConfirmed(true))
      .catch((res) => {
        const { pushNotification } = useContext(NotificationContext)
        const notification = Notification.error()
        pushNotification(notification)
      })
  }

  return (
    <div>
      {confirmed == false ? (
        <>
          <h6 className="confirm-hint">( mock email - SNS sandbox :( )</h6>
          <h3 className="confirm-title">Thank you!</h3>
          <p className="confirm-description">
            Click the button below to activate your account.
          </p>
          <button className="confirm-activate-btn" onClick={activateAccount}>
            Activate
          </button>
        </>
      ) : (
        <>
          <h2>Account is active!</h2>
          <p>Now you can log in</p>
          <Link to="/login" className="register-login-link">
            <p style={{ marginLeft: 0 }}>Login</p>
          </Link>
        </>
      )}
    </div>
  )
}
