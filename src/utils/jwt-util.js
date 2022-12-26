export function removeJwt(setJwt, setUsername) {
  setJwt('')
  setUsername('')
  localStorage.removeItem('jwt')
}
