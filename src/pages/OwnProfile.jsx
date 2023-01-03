import { faRemove } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtRequest } from '../utils/my-requests'
import './OwnProfile.css'

const url = 'http://localhost:8080'
const userInfoUrl = url + '/api/profile/info'
const saveImageUrl = url + '/api/profile/image'
const getLoadImageUrl = (username) => url + `/api/users/${username}/image`

export default function OwnProfile() {
  const [user, setUser] = useState({})
  const [image, setImage] = useState(null)
  const [changedImage, setChangedImage] = useState(false)
  const navigate = useNavigate()

  let imageSource = ''
  if (image) imageSource = URL.createObjectURL(image)

  useEffect(() => {
    jwtRequest.get(userInfoUrl, {}).then((res) => {
      setUser(res.data)
    })
  }, [])

  useEffect(() => {
    if (!user.username) return

    jwtRequest
      .get(getLoadImageUrl(user.username), { responseType: 'blob' })
      .then((res) => {
        setImage(res.data)
      })
  }, [user])

  function removeImage() {
    setChangedImage(user.hasImage) // true if there was image before
    setImage(null)
  }

  function sendChangesToServer() {
    if (!changedImage) return

    const data = new FormData()
    data.append('file', image)
    const headers = {
      'Content-Type': 'multipart/form-data',
    }
    jwtRequest.post(saveImageUrl, data, { headers }).then((res) => {
      navigate(0)
    })
  }

  return (
    <div className="container d-flex">
      <div className="own-profile">
        <div>
          <div className="own-profile-image-box">
            <div className="own-profile-image-wrapper">
              <button
                className="btn own-profile-remove-image-btn"
                onClick={removeImage}
              >
                <FontAwesomeIcon icon={faRemove} />
              </button>
              <img className="own-profile-image" src={imageSource} />
            </div>
          </div>
          <input
            className="own-profile-image-input"
            type="file"
            name="image"
            onChange={(event) => {
              setChangedImage(true)
              setImage(event.target.files[0])
            }}
          />
        </div>

        <div className="own-profile-info">
          <div className="own-profile-field">
            <h6 className="own-profile-field-title">username</h6>
            <p className="own-profile-field-value">{user.username}</p>
          </div>
          <div className="own-profile-field">
            <h6 className="own-profile-field-title">email</h6>
            <p className="own-profile-field-value">{user.email}</p>
          </div>
          <button
            className="btn own-profile-save-image-btn"
            onClick={sendChangesToServer}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
