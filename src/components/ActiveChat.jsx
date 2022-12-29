import './ActiveChat.css'

export default function ActiveChat(props) {
  const { messages, setMessages } = props

  return (
    <>
      <div className="overflow-auto d-flex flex-column py-4 px-3 h-100">
        {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((x) => (
          <>
            <p className="col-6 rounded-3 mx-3 mt-2 mb-1 p-3 many-white-chars message-left">
              content
            </p>
            <p className="px-4 my-0" style={{ alignSelf: 'start' }}>
              10:23
            </p>
            <p className="col-6 rounded-3 mx-3 mt-2 mb-1 p-3 many-white-chars message-right">
              content2
            </p>
            <p className="px-4 my-0" style={{ alignSelf: 'end' }}>
              10:23
            </p>
          </>
        ))}
      </div>
      <div className="row mx-2 mt-3">
        <textarea
          className="col rounded-2 p-1 px-2"
          style={{ height: '5rem', resize: 'none' }}
        ></textarea>
        <button type="button" className="btn btn-primary col-1 ms-4 my-auto">
          Send
        </button>
      </div>
    </>
  )
}
