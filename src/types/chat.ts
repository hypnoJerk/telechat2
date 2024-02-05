type Message = {
  role: string
  content: string | Content | Content[]
}

type Content = {
  type: string
  text?: string
  image_url?: {
    url: string
    detail: string
  }
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
  model: string
}

export { Chat, Message, MessageList, MessageListInterface }
