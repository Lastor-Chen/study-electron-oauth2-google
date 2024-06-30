// @ts-check
import axios from 'axios'

const clientId = 'your_google_oauth2_client_id'
const clientSecret = 'your_google_oauth2_client_secret'

export const redirectUri = 'http://localhost/oauth/google'

export const credentials = {
  accessToken: '',
  refreshToken: '',
}

/**
 * @typedef {object} TokenData
 * @property {string} access_token
 * @property {number} expires_in in seconds
 * @property {string} id_token
 * @property {string} refresh_token
 * @property {string} scope
 * @property {string} token_type
 */

export function getAuthUrl() {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  const searchParams = new URLSearchParams({
    scope: 'email profile',
    response_type: 'code',
    // state: '',
    redirect_uri: redirectUri,
    client_id: clientId,
  })

  url.search = `?${searchParams}`

  return url.href
}

/** @param {string} code  */
export async function postExchangeToken(code) {
  try {
    /** @type {{ data: TokenData }} */
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })

    // 解 user profile from JWT
    const jwt = Buffer.from(data.id_token.split('.')[1], 'base64url').toString()
    const info = JSON.parse(jwt)

    return {
      ...data,
      userInfo: info,
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log({ err: err.response?.data })
    }
  }
}

export async function getUserInfo() {
  try {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`
      }
    })

    return data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log({ err: err.response?.data })
    }
  }
}
