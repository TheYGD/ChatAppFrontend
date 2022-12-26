import { useState, useContext, useEffect } from 'react'
import './Login.css'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../App'

const LOGIN_SERVER_ERROR_MESSAGE = 'Some error occured'
const LOGIN_BAD_ERROR_MESSAGE = 'Wrong username or password'

const url = 'http://localhost:8080'
const loginUrl = url + '/api/login'
const urlGetUsername = url + '/api/get-username'

export default function Login() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [badLogin, setBadLogin] = useState(false)
  const [errorLogin, setErrorLogin] = useState(false)

  const navigate = useNavigate()
  const { setJwt, setUsername } = useContext(AppContext)

  useEffect(() => {
    if (localStorage.jwt) {
      navigate('/')
    }
  }, [])

  function performLogin() {
    const requestBody = { username: login, password: password }

    axios
      .post(loginUrl, new URLSearchParams(requestBody))
      .then((res) => {
        if (res.status != 200) throw new Exception('An error occured')
        saveJwtToLocalstorage(res)
        navigate('/')
      })
      .catch((err) => {
        console.log(err)
        setErrorLogin(true) // bad connection
      })
  }

  function saveJwtToLocalstorage(response) {
    setJwt(response.data.jwt)
    localStorage.setItem('jwt', response.data.jwt)
    axios
      .get(urlGetUsername, {
        headers: {
          Authorization: 'Bearer ' + localStorage.jwt,
        },
      })
      .then((res) => {
        if (res.status === 200) setUsername(res.data)
      })
  }

  function clearLoginErrors() {
    setBadLogin(false)
    setErrorLogin(false)
  }

  function Errors() {
    return (
      <>
        {badLogin && <p className="login-error">{LOGIN_BAD_ERROR_MESSAGE}</p>}
        {errorLogin && (
          <p className="login-error">{LOGIN_SERVER_ERROR_MESSAGE}</p>
        )}
      </>
    )
  }

  return (
    <div className="login-box">
      <h1 className="login-title">Log in</h1>
      <form className="login-form">
        <Errors />
        <label className="login-label">
          username or email
          <input
            className="login-input"
            type="text"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
          />
        </label>
        <label className="login-label">
          password
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          className="login-btn"
          type="button"
          onClick={performLogin}
          onBlur={clearLoginErrors}
        >
          Log in
        </button>
        <p>
          Haven't registered yet?
          <Link className="link-register" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
