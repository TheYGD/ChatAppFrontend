import { useNavigate } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import { AppContext } from '../App'

export default function Logout() {
  const { setJwt, setUsername } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    removeJwt(setJwt, setUsername)
    navigate('/login')
  }, [])
}

function removeJwt(setJwt, setUsername) {
  setJwt(null)
  setUsername(null)
  localStorage.removeItem('jwt')
}
