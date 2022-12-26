import './RegisterInputs.css'
import MyInput from './MyInput'

export default function RegisterInputs() {
  return (
    <div className="register-inputs">
      <MyInput
        name="username"
        type="text"
        value={username}
        onChange={setUsername}
      />
      <MyInput name="email" type="email" value={email} onChange={setEmail} />
      <MyInput
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
      />
      <MyInput
        name="repeat password"
        type="password"
        value={passwordRepeat}
        onChange={setPasswordRepeat}
      />
    </div>
  )
}
