import { useNavigate } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import { AppContext } from '../App'
import { removeJwt } from '../utils/jwt-util'

export default function Logout() {
  const { setJwt, setUsername } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    removeJwt(setJwt, setUsername)
    navigate('/login')
  }, [])
}
