const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  oauthSignin() {
    ipcRenderer.send('oauthSignin')
  },
  onAccessToken(cb) {
    ipcRenderer.on('access-token', (event, value) => cb(value))
  },
  testCall() {
    return ipcRenderer.invoke('test-call')
  },
})
