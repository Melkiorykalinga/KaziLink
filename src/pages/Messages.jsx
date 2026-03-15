import { useState } from 'react';
import { Send, Search, Phone, Video, MoreVertical } from 'lucide-react';
import { conversations } from '../data/mockData';
import './Messages.css';

export default function Messages() {
  const [activeConvo, setActiveConvo] = useState(conversations[0]);
  const [inputValue, setInputValue] = useState('');
  const [localMessages, setLocalMessages] = useState({});

  const getMessages = (convo) => {
    return [...convo.messages, ...(localMessages[convo.id] || [])];
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMsg = { id: Date.now(), sender: 'worker', text: inputValue, time: 'Now' };
    setLocalMessages(prev => ({
      ...prev,
      [activeConvo.id]: [...(prev[activeConvo.id] || []), newMsg],
    }));
    setInputValue('');
  };

  return (
    <div className="page-wrapper">
      <div className="container messages-container">
        <div className="messages-layout">
          {/* Sidebar */}
          <aside className="convos-sidebar">
            <div className="convos-header">
              <h2>Messages</h2>
              <div className="convos-search">
                <Search size={16} />
                <input type="text" placeholder="Search conversations..." />
              </div>
            </div>
            <div className="convos-list">
              {conversations.map(convo => (
                <button
                  key={convo.id}
                  className={`convo-item ${activeConvo.id === convo.id ? 'active' : ''}`}
                  onClick={() => setActiveConvo(convo)}
                >
                  <span className="convo-avatar">{convo.avatar}</span>
                  <div className="convo-info">
                    <div className="convo-top">
                      <span className="convo-name">{convo.participant}</span>
                      <span className="convo-time">{convo.time}</span>
                    </div>
                    <p className="convo-preview">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && <span className="convo-unread">{convo.unread}</span>}
                </button>
              ))}
            </div>
          </aside>

          {/* Chat */}
          <main className="chat-main">
            <div className="chat-header">
              <div className="chat-header-info">
                <span className="chat-avatar">{activeConvo.avatar}</span>
                <div>
                  <span className="chat-name">{activeConvo.participant}</span>
                  <span className="chat-status">Online</span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="icon-btn"><Phone size={18} /></button>
                <button className="icon-btn"><Video size={18} /></button>
                <button className="icon-btn"><MoreVertical size={18} /></button>
              </div>
            </div>

            <div className="chat-messages">
              {getMessages(activeConvo).map(msg => (
                <div key={msg.id} className={`message ${msg.sender === 'worker' ? 'sent' : 'received'}`}>
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                className="input-field"
                placeholder="Type a message..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button className="btn btn-primary send-btn" onClick={handleSend}>
                <Send size={18} />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
