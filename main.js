// @ts-check
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

import { credentials, redirectUri, getAuthUrl, postExchangeToken, getUserInfo } from './apis/oauth2.js'

/** @type {BrowserWindow | undefined} */
let win

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js')
    }
  })

  win.loadFile(path.join(import.meta.dirname, './client/index.html'))
  win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('oauthSignin', () => {
  const testWin = new BrowserWindow({
    width: 480,
    height: 640,
    show: false,
  })

  testWin.webContents.on('will-redirect', async (event, newUrl) => {
    const url = new URL(newUrl)
    const originUri = url.origin + url.pathname
    if (originUri === redirectUri) {
      event.preventDefault()
      testWin.destroy()

      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')
      console.log('auth callback', { code, error })
      if (code) {
        const tokens = await postExchangeToken(code)
        credentials.accessToken = tokens?.access_token || ''
        credentials.refreshToken = tokens?.refresh_token || ''

        win?.webContents.send('access-token', tokens)
      }
    }
  })

  testWin.on('closed', function() {
    testWin.destroy()
  })

  testWin.loadURL(getAuthUrl())
  testWin.show()
})

ipcMain.handle('test-call', async (event) => {
  const data = await getUserInfo()
  console.log(data)

  return data
})
