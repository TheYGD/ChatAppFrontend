import { NavLink } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './AppWithNavbarAndConnection'
import './Navbar.css'

export default function Navbar() {
  const { username } = useContext(AppContext)

  return (
    <ul className="my-navbar">
      <li>
        <NavLink className="my-navbar-link" to="/">
          Chats
        </NavLink>
      </li>

      <li>
        <NavLink className="my-navbar-link" to="/profile">
          {username}
        </NavLink>
        <ul className="my-navbar-dropdown">
          <li>
            <NavLink className="my-navbar-link" to="/logout">
              logout
            </NavLink>
          </li>
        </ul>
      </li>
    </ul>
  )
}
