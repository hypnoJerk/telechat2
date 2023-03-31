import exp from 'constants'

type Message = {
  role: string
  content: string
}

type MessageList = {
  messages: Message[]
}

// create interface for list of Messages
interface MessageListInterface {
  messages: Message[]
}

// chat type
type Chat = {
  chatId: number
  messages?: MessageListInterface
  message?: Message
  temperature: number
  promptId?: string
  prompt?: string
}

export { Chat, Message, MessageList, MessageListInterface }
