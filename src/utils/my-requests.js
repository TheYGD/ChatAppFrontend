import axios from 'axios'

const logoutIfBadLogin = (err) => {
  if (err.response.status === 401) {
    location.href = location.origin + '/logout'
  } else throw err
}

function addAuthorizationToConfig(config) {
  return {
    ...config,
    headers: {
      ...config?.headers,
      Authorization: 'Bearer ' + localStorage.jwt,
    },
  }
}

/** request with added jwt from localStorage + WITHOUT redirect to /logout if got error 401 */
export const jwtRequestNoCatch = {
  get: async function (url, config) {
    config = addAuthorizationToConfig(config)
    return axios.get(url, config)
  },
  post: async function (url, data, config) {
    config = addAuthorizationToConfig(config)
    return axios.post(url, data, config)
  },
  delete: async function (url, config) {
    config = addAuthorizationToConfig(config)
    return axios.delete(url, config)
  },
  put: async function (url, data, config) {
    config = addAuthorizationToConfig(config)
    return axios.put(url, data, config)
  },
}

/** request with added jwt from localStorage + redirect to /logout if got error 401 */
export const jwtRequest = {
  get: async function (url, config) {
    return jwtRequestNoCatch.get(url, config).catch(logoutIfBadLogin)
  },
  post: async function (url, data, config) {
    return jwtRequestNoCatch.post(url, data, config).catch(logoutIfBadLogin)
  },
  delete: async function (url, config) {
    return jwtRequestNoCatch.delete(url, config).catch(logoutIfBadLogin)
  },
  put: async function (url, data, config) {
    return jwtRequestNoCatch.put(url, data, config).catch(logoutIfBadLogin)
  },
}
