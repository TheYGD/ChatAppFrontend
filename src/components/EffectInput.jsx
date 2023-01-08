import './EffectInput.css'

export default function EffectInput(props) {
  const { name, type, inputObject } = props
  const {
    value,
    setValue,
    valid,
    setValid,
    onChangePredicate,
    onLoseFocusPredicate,
    errorInputMessage,
    validWithServer,
    setValidWithServer,
    onLoseApiCallPredicate,
    errorApiMessage,
  } = inputObject

  function onChangeWithValidation(newValue) {
    if (!onChangePredicate(newValue)) setValid(false)
    else {
      setValid(true)
      setValue(newValue)
    }
  }

  async function onLostFocusWithValidation() {
    // on blur
    if (valid && onLoseFocusPredicate()) {
      setValid(true)
    } else {
      setValid(false)
      return
    }

    // check with server
    if (setValidWithServer) {
      if (!(await onLoseApiCallPredicate())) {
        setValidWithServer(false)
      } else if (!validWithServer) {
        setValidWithServer(true)
      }
    }
  }

  return (
    <>
      <label className="my-label">
        {name}
        <input
          className="my-input"
          type={type}
          value={value}
          onChange={(event) => onChangeWithValidation(event.target.value)}
          onBlur={() => onLostFocusWithValidation()}
        ></input>
      </label>
      {!valid && <p className="my-input-error">{errorInputMessage}</p>}
      {!validWithServer && <p className="my-input-error">{errorApiMessage}</p>}
    </>
  )
}
