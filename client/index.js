/** @type {HTMLButtonElement} */
const signInBtn = document.querySelector('#signinBtn')
const testCallBtn = document.querySelector('#testCallBtn')

signInBtn.addEventListener('click', () => {
  window.electron.oauthSignin()
})

window.electron.onAccessToken((tokens) => {
  console.log({ tokens })
})

testCallBtn.addEventListener('click', async () => {
  const data = await window.electron.testCall()
  console.log(data)
})
