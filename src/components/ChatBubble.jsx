export default function ChatBubble({ message, isOwn, senderName, timestamp }) {
  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && senderName && (
          <span className="text-xs text-muted mb-1 px-1">{senderName}</span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-surface text-white rounded-bl-md'
          }`}
        >
          {message}
        </div>
        {timestamp && (
          <span className="text-[10px] text-muted mt-0.5 px-1">{time}</span>
        )}
      </div>
    </div>
  )
}
