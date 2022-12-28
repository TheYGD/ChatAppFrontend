import { NavLink } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../App'
import './Navbar.css'

export default function Navbar() {
  const { username } = useContext(AppContext)

  return (
    <ul className="navbar">
      <li>
        <NavLink className="navbar-link" to="/">
          Chats
        </NavLink>
      </li>

      <li>
        <NavLink className="navbar-link" to="/profile">
          {username}
        </NavLink>
        <ul className="navbar-dropdown">
          <li>
            <NavLink className="navbar-link" to="/logout">
              logout
            </NavLink>
          </li>
        </ul>
      </li>
    </ul>
  )
}
