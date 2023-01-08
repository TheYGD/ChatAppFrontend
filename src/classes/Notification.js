import { v4 as UUID } from 'uuid'

export const NotificationType = {
  SUCCESS: { notificationClass: 'notification-success' },
  FAIL: { notificationClass: 'notification-fail' },
}

const DEFAULT_ERROR_MESSAGE = 'Some error occured. Try again later.'

/**
 * @field id
 * @field type - NotificationType, contains css class
 * @field kind - kind of notification, meant to be used to identify repeated notifications
 * @field message - content of the notification
 */
export class Notification {
  constructor(type, kind, message) {
    this.id = UUID()
    this.type = type
    this.kind = kind
    this.message = message
  }

  static success(message) {
    return new Notification(NotificationType.SUCCESS, message, message)
  }

  static fail(message) {
    return new Notification(NotificationType.FAIL, message, message)
  }

  static error() {
    return new Notification(
      NotificationType.FAIL,
      DEFAULT_ERROR_MESSAGE,
      DEFAULT_ERROR_MESSAGE
    )
  }

  /** By default @param kind - random UUID */
  static successKind(message, kind = UUID()) {
    return new Notification(NotificationType.SUCCESS, kind, message)
  }

  /** By default @param kind - random UUID */
  static failKind(message, kind = UUID()) {
    return new Notification(NotificationType.FAIL, kind, message)
  }
}
