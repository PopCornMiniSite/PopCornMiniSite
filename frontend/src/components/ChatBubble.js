import React from 'react'

export default function ChatBubble({ message, isOwn, senderName, timestamp }) {
  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div style={{ display: 'flex', marginBottom: '12px', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
        {!isOwn && senderName && (
          <span style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', paddingLeft: '4px', paddingRight: '4px' }}>{senderName}</span>
        )}
        <div style={{
          padding: '10px 16px',
          borderRadius: '16px',
          fontSize: '14px',
          lineHeight: '1.5',
          backgroundColor: isOwn ? '#E50914' : '#141428',
          color: '#fff',
          borderBottomRightRadius: isOwn ? '4px' : '16px',
          borderBottomLeftRadius: !isOwn ? '4px' : '16px',
        }}>
          {message}
        </div>
        {timestamp && (
          <span style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px', paddingLeft: '4px', paddingRight: '4px' }}>{time}</span>
        )}
      </div>
    </div>
  )
}
