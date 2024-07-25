type Message = {
  role: string
  name?: string
  content: string | Content | Content[] | null
  tool_calls?: Tool_calls[]
}

type Content = {
  type: string
  text?: string
  image_url?: {
    url: string
    detail: string
  }
}

type Tool_calls = {
  id: string
  type: string
  function: {
    name: string
    arguments: string
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
  tools?: any
  tool_choice?: string
}

export { Chat, Content, Message, MessageList, MessageListInterface, Tool_calls }
