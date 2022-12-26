export class InputObject {
  constructor(
    value,
    setValue,
    valid,
    setValid,
    onChangePredicate,
    onLoseFocusPredicate,
    errorInputMessage,
    validWithServer = true,
    setValidWithServer = null,
    onLoseApiCallPredicate = () => true,
    errorApiMessage = ''
  ) {
    this.value = value
    this.setValue = setValue
    this.valid = valid
    this.setValid = setValid
    this.onChangePredicate = onChangePredicate
    this.onLoseFocusPredicate = onLoseFocusPredicate
    this.errorInputMessage = errorInputMessage
    this.validWithServer = validWithServer
    this.setValidWithServer = setValidWithServer
    this.onLoseApiCallPredicate = onLoseApiCallPredicate
    this.errorApiMessage = errorApiMessage
  }
}
