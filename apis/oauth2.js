// @ts-check
import fs from 'node:fs'
import path from 'node:path'

import axios from 'axios'
import { google } from 'googleapis'

export let redirectUri = 'your_google_oauth2_redirect_uri'

/** @type {import('googleapis').Auth.OAuth2Client | undefined} */
let oauth2Client

fs.readFile(path.join(process.cwd(), '/oauth2.keys.json'), 'utf8', (err, data) => {
  if (err) {
    console.log(`[Error] Cannot found "./oauth2.keys.json"`)
  } else {
    const json = JSON.parse(data)
    redirectUri = json.web.redirect_uris[0]
    oauth2Client = new google.auth.OAuth2(
      json.web.client_id,
      json.web.client_secret,
      json.web.redirect_uris[0],
    )
  }
})

export function getAuthUrl() {
  if (!oauth2Client) return 'https://accounts.google.com/o/oauth2/v2/auth'

  const authUrl = oauth2Client.generateAuthUrl({
    // offline 才會有 refresh token, 並自動按需更新
    access_type: 'offline',
    scope: ['email', 'profile'],
  })

  return authUrl
}

/** @param {string} code  */
export async function postExchangeToken(code) {
  if (!oauth2Client) return console.log(`[Error] Cannot found "./oauth2.keys.json"`)

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
  
    // 解 user profile from JWT
    let info = ''
    if (tokens.id_token) {
      const jwt = Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString()
      info = JSON.parse(jwt)
    }
  
    return {
      ...tokens,
      userInfo: info,
    }
  } catch (err) {
    console.log(err.message)
  }
}

export async function getUserInfo() {
  if (!oauth2Client) return console.log(`[Error] Cannot found "./oauth2.keys.json"`)

  try {
    const accessToken = oauth2Client.credentials.access_token
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    return data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log({ err: err.response?.data })
    }
  }
}
