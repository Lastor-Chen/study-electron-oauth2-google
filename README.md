## Overview

Electron 提供一個叫做 Deep Links 的功能，可以自定義一個 uri path 例如 `electron-fiddle`，之後在瀏覽器 `GET electron-fiddle://some/path` 就可以開啟該 electron app，並觸發 `second-instance` (windows) 或 `open-url` (mac) 事件

但 Google OAuth2 的 redirect_uri 參數限用 HTTP 協定，無法使用 [Custom URI](https://developers.google.com/identity/protocols/oauth2/native-app#redirect-uri_custom-scheme)，因此有兩種主流方法:

1. 透過一個 HTTP Server 轉接，導回 electron ([Google 推薦](https://developers.google.com/identity/protocols/oauth2/native-app#redirect-uri_loopback))

```
google oauth -> redirect_uri=http://localhost:3000 -> 跳轉 electron-fiddle://some/path
```

缺點: 但這樣就得在 Electron 裡面架設 Server, 徒增開發成本

2. 讓 Electron 去開這個 oauth url 的 window 取得控制權，用相關 API 監聽 redirect 事件攔截 oauth 的 callback 資訊

詳見: [Handling oauth2 redirect from electron (or other desktop platforms)](https://stackoverflow.com/questions/37546656/handling-oauth2-redirect-from-electron-or-other-desktop-platforms)


### 其他參考
Redirect to electron app custom scheme with Google Identity Service
https://stackoverflow.com/questions/72562672/redirect-to-electron-app-custom-scheme-with-google-identity-service

How can I use Google sign-in inside of an Electron desktop application?
https://stackoverflow.com/questions/66769003/how-can-i-use-google-sign-in-inside-of-an-electron-desktop-application

[教程] Electron.js 桌面应用怎么做 Google OAuth 登录
https://1c7.me/electron-js-oauth-google/

How to implement google authentication in your Electron app?
https://arunpasupathi.medium.com/how-to-implement-google-authentication-in-your-electron-app-aec168af7410

## 問題

- Google Console 建立 OAuth 時, user type 要選 internal 還是 external?
  - internal 要 GWS 帳戶才能用
  - Google OAuth 帳戶要誰開?
- client_id, client_secret 這些敏感資訊要存在哪?
- 直接委託 backend server 去介接 oauth2 callback?
- 在哪 handle oauth 更合適? renderer or node.js?
