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
  messages?: MessageList
  message?: Message
  temperature: number
  promptId?: string
  prompt?: string
  promptLimit: number
}

export { Chat, Message, MessageList, MessageListInterface }
