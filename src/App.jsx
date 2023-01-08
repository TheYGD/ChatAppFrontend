import { createContext, useState, useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import './App.css'
import Chats from './pages/Chats'
import Register from './pages/Register'
import AppWithNavbarAndConnection, {
  AppContext,
} from './components/AppWithNavbarAndConnection'
import Login from './pages/Login'
import Logout from './pages/Logout'
import CreateChat from './pages/CreateChat'
import OwnProfile from './pages/OwnProfile'
import NotificationContainer, {
  addNotification as addNotificationRaw,
} from './components/NotificationContainer'

function AppWithoutNavbar() {
  return (
    <div className="app-content-center">
      <Outlet />
    </div>
  )
}

export const NotificationContext = createContext()

export default function App() {
  const [notifications, setNotifications] = useState([])
  const notificationContextValue = {
    pushNotification,
  }

  function pushNotification(notification) {
    return addNotificationRaw(setNotifications, notification)
  }

  return (
    <NotificationContext.Provider value={notificationContextValue}>
      <NotificationContainer notifications={notifications} />
      <Routes>
        <Route path="/" element={<AppWithoutNavbar />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<AppWithNavbarAndConnection />}>
          <Route index element={<Chats />} />
          <Route path="/create-chat" element={<CreateChat />} />
          <Route path="/profile" element={<OwnProfile />} />
          <Route path="/logout" element={<Logout />} />
        </Route>
      </Routes>
    </NotificationContext.Provider>
  )
}
