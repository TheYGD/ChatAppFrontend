import SockJS from 'sockjs-client/dist/sockjs'
import Stomp from 'stompjs'

export class StompService {
  constructor(appContext, websocketUrl) {
    this.websocketUrl = websocketUrl
    for (const property in appContext) {
      this[property] = appContext[property]
    }
  }

  establishStompConnection() {
    this.socket = new SockJS(this.websocketUrl, null, {})
    this.stompClient = Stomp.over(this.socket)

    const stompService = this
    stompService.stompClient.connect(
      { jwt: 'Bearer ' + this.jwt },
      function (frame) {
        stompService.stompClient.subscribe(
          '/topic/users/' + stompService.username,
          function (frame) {
            const wsMessage = JSON.parse(frame.body)
            if (stompService.handleMessageFromWSRef.current)
              stompService.handleMessageFromWSRef.current(wsMessage)
          }
        )
      }
    )
  }

  closeStompConnection() {
    stompClient.disconnect()
  }
}
