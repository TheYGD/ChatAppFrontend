import { useState, useCallback, useContext } from 'react'
import './MessageInputBox.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperclip, faRemove } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuid } from 'uuid'
import { useDropzone } from 'react-dropzone'
import { NotificationContext } from '../App'
import { Notification } from '../classes/Notification'
import { config } from '../config/app-config'
import { jwtRequest } from '../utils/my-requests'
import Loading from './Loading'

const url = config.backendUrl
const getSendMessageUrlFromChatId = (chatId) =>
  url + `/api/chats/${chatId}/messages`
const getSendFilesUrlFromChatId = (chatId) => url + `/api/chats/${chatId}/files`

function UploadedFile(props) {
  const {
    remove: removeImage,
    file: { file },
  } = props

  const isImage = file.type.startsWith('image')

  let displayedObject
  if (isImage) {
    const imageSource = URL.createObjectURL(file)
    displayedObject = (
      <img className="messagebox-uploaded-image" src={imageSource} />
    )
  } else {
    displayedObject = (
      <p className="messagebox-uploaded-file-name">{file.name}</p>
    )
  }

  return (
    <div
      className={'messagebox-uploaded-' + (isImage ? 'image' : 'file') + '-box'}
    >
      {displayedObject}
      <button className="btn messagebox-image-remove-btn" onClick={removeImage}>
        <FontAwesomeIcon icon={faRemove} />
      </button>
    </div>
  )
}

export default function MessageInputBox(props) {
  const { chat } = props
  const [messageContent, setMessageContent] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [sendingInProgress, setSendingInProgress] = useState(false)
  const { pushNotification } = useContext(NotificationContext)

  const onDrop = useCallback((acceptedFiles) => addFiles(acceptedFiles), [])
  const { getRootProps, isDragActive } = useDropzone({ onDrop })

  const height = (uploadedFiles.length ? 10 : 5) + 'rem'
  const paddingTop = 0.25 + (uploadedFiles.length ? 5 : 0) + 'rem'

  function addFiles(files) {
    setUploadedFiles((prevFiles) => {
      const newUniqueFiles = files.filter((newFile) => {
        return !prevFiles.find((fileObj) => fileObj.file.name === newFile.name)
      })

      const newFiles = newUniqueFiles.map((file) => ({
        id: uuid(),
        file: file,
      }))

      return [...prevFiles, ...newFiles]
    })
  }

  function removeFile(fileToBeRemoved) {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file.id !== fileToBeRemoved.id)
    )
  }

  async function sendMessageIfPossible() {
    if (!sendingInProgress) {
      setSendingInProgress(true)
      await sendMessage(
        chat,
        messageContent,
        setMessageContent,
        uploadedFiles,
        setUploadedFiles,
        pushNotification
      )
      setSendingInProgress(false)
    }
  }

  return (
    <div className="messagebox row">
      <div className="col dropzone" {...getRootProps()} onClick={() => {}}>
        {uploadedFiles.length != 0 && (
          <div className="messagebox-images">
            {uploadedFiles.map((file) => {
              return (
                <UploadedFile
                  key={file.id}
                  file={file}
                  remove={() => removeFile(file)}
                />
              )
            })}
          </div>
        )}
        <textarea
          className="messagebox-input"
          style={{ height: height, paddingTop: paddingTop, resize: 'none' }}
          value={messageContent}
          onChange={(event) => setMessageContent(event.target.value)}
        ></textarea>
        <div
          className="dropzone-on-drag"
          style={{ display: isDragActive ? 'flex' : 'none' }}
        >
          Drop file(s)
        </div>
      </div>

      <div className="col-1 messagebox-buttons">
        <label className="btn btn-light messagebox-file-upload">
          <input
            type="file"
            multiple
            onChange={(event) => {
              addFiles(Array.from(event.target.files))
              event.target.value = ''
            }}
          />
          <FontAwesomeIcon icon={faPaperclip} />
        </label>
        <button
          style={sendingInProgress ? { background: 'rgb(169, 196, 235)' } : {}}
          className="btn messagebox-btn"
          onClick={sendMessageIfPossible}
        >
          Send
          {sendingInProgress && (
            <div className="messagebox-loading">
              <Loading />
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

async function sendMessage(
  chat,
  content,
  setContent,
  uploadedFiles,
  setUploadedFiles,
  pushNotification
) {
  if (content.trim() != '') {
    console.log('wysylam mess')
    const params = { content }
    await jwtRequest
      .post(getSendMessageUrlFromChatId(chat.id), {}, { params })
      .then((res) => {
        setContent('')
      })
      .catch((err) => {
        const notification = Notification.error()
        pushNotification(notification)
      })
  }

  console.log(uploadedFiles)
  if (uploadedFiles.length) {
    console.log('\n***wysylam files ***\n')
    const data = new FormData()
    uploadedFiles.forEach((fileObj) => data.append('file', fileObj.file))
    console.log(uploadedFiles)
    console.log(data)

    const headers = {
      'Content-Type': 'multipart/form-data',
    }
    await jwtRequest
      .post(getSendFilesUrlFromChatId(chat.id), data, { headers })
      .then((res) => {
        setUploadedFiles([])
      })
      .catch((err) => {
        const notification = Notification.error()
        pushNotification(notification)
      })
  }
}
