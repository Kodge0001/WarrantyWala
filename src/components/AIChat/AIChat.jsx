import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  X,
  Bot,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { api } from '../../api/client'
import './AIChat.css'

export default function AIChat({ onOpenClaimAssistant, onOpenScanner }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your **WarrantyWala AI Advisor**. Ask me anything about your warranty validity, consumer rights in India, or let me generate claim letters for defective electronics.',
      suggestedActions: ['Check Expiring Warranties', 'Draft a Claim Letter', 'Scan a Receipt'],
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (userText) => {
    const query = userText || input
    if (!query.trim()) return

    const newMsgs = [...messages, { sender: 'user', text: query }]
    setMessages(newMsgs)
    setInput('')
    setIsLoading(true)

    try {
      const res = await api.sendAIChat(query)
      if (res.success && res.data) {
        setMessages([
          ...newMsgs,
          {
            sender: 'ai',
            text: res.data.reply,
            suggestedActions: res.data.suggestedActions || [],
          },
        ])
      } else {
        setMessages([
          ...newMsgs,
          {
            sender: 'ai',
            text: 'I could not process your query at this moment. Please verify your connection.',
          },
        ])
      }
    } catch (err) {
      console.error(err)
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: 'Unable to reach AI server. Please make sure the backend is running.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleActionClick = (action) => {
    if (action.includes('Claim')) {
      if (onOpenClaimAssistant) onOpenClaimAssistant()
    } else if (action.includes('Scan')) {
      if (onOpenScanner) onOpenScanner()
    } else {
      handleSend(action)
    }
  }

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <motion.button
        className="ai-chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles size={18} />
        <span>Ask AI Advisor</span>
      </motion.button>

      {/* Slide-in Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chat-drawer"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="chat-drawer-header">
              <div className="ai-brand-title">
                <div className="ai-avatar-icon">
                  <Bot size={16} />
                </div>
                <div>
                  <h4>Warranty AI Copilot</h4>
                  <span className="online-indicator">● Active Neural Model</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="chat-drawer-body">
              {messages.map((m, index) => (
                <div key={index} className={`chat-message-bubble ${m.sender}`}>
                  <div className="bubble-content">
                    <p className="bubble-text">{m.text}</p>
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="suggested-actions">
                        {m.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            className="suggestion-chip"
                            onClick={() => handleActionClick(action)}
                          >
                            <span>{action}</span>
                            <ChevronRight size={12} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message-bubble ai loading">
                  <Loader2 size={16} className="spin" />
                  <span>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="chat-drawer-footer"
            >
              <input
                type="text"
                className="chat-input"
                placeholder="Ask about repairs, claims, or deadlines..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="chat-send-btn" disabled={isLoading || !input.trim()}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
