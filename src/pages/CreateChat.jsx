import './CreateChat.css'
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons'
import { jwtRequest } from '../utils/my-requests'
import { useState, useContext } from 'react'
import { AppContext } from '../components/AppWithNavbarAndConnection'

const url = 'http://localhost:8080'
const searchForUserUrl = url + '/api/users-by-phrase'
const createChatUrl = url + '/api/chats'

function User(props) {
  console.log(props)
  const { id, username, createChatWithId } = props
  const loggedUser = useContext(AppContext)

  return (
    <li className="col-3">
      <div className="user row">
        <div className="user-info col-9">
          <div className="user-img"></div>
          <h5 className="user-name">{username}</h5>
        </div>
        {loggedUser.username != username ? (
          <button
            className="user-create-chat-btn btn col-1"
            onClick={() => createChatWithId(id)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        ) : (
          <></>
        )}
      </div>
    </li>
  )
}

export default function CreateChat() {
  const [foundUsers, setFoundUsers] = useState([])
  const [searchPhrase, setSearchPhrase] = useState('')
  const [pageNr, setPageNr] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [searched, setSearched] = useState(false)
  const navigate = useNavigate()

  function createChatWithId(id) {
    const params = {
      id,
    }
    jwtRequest
      .post(createChatUrl, {}, { params })
      .then((res) => {
        navigate('/')
      })
      .catch((err) => {
        if (err.response.status === 409) navigate('/') // todo open this chat
      })
  }

  function searchForUser(pageRequest) {
    if (searchPhrase === '') return
    const params = {
      phrase: searchPhrase,
      pageNr: pageRequest,
    }
    jwtRequest.get(searchForUserUrl, { params }).then((res) => {
      const { content: users, totalPages } = res.data
      setSearched(true)
      setFoundUsers(users)
      setPageCount(totalPages)
      setPageNr(pageRequest)
    })
  }

  function goToPreviousPage() {
    if (pageNr > 0) searchForUser(pageNr - 1)
  }

  function goToNextPage() {
    if (pageNr < pageCount - 1) searchForUser(pageNr + 1)
  }

  return (
    <div className="container create-chat-users-content">
      <Link to="/" className="back-to-chats-link">
        Back to chats
      </Link>
      <div className="search-for-user-box">
        <input
          className="search-for-user-input"
          type="text"
          placeholder="search for user..."
          min="3"
          value={searchPhrase}
          onChange={(event) => setSearchPhrase(event.target.value)}
        />
        <button
          className="search-for-user-btn btn"
          onClick={() => searchForUser(0)}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
      <ul className="create-chat-users-list row ps-3">
        {searched && foundUsers.length == 0 ? (
          <h4 className="mt-4">Couldn't find that user</h4>
        ) : (
          foundUsers.map((user) => (
            <User key={user.id} {...user} createChatWithId={createChatWithId} />
          ))
        )}
      </ul>
      {pageCount != 0 ? (
        <div className="search-for-user-pageable">
          <button
            className="btn search-for-user-pageable-btn"
            onClick={goToPreviousPage}
          >
            {'<'}
          </button>
          <p>{pageNr + 1 + ' / ' + pageCount}</p>
          <button
            className="btn search-for-user-pageable-btn"
            onClick={goToNextPage}
          >
            {'>'}
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
