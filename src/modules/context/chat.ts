import { MessageList, Chat, Message } from '../../types/chat'
import { API } from '../../modules/api/server'
import DB from '../../modules/context/db'

interface ChatAIInterface {
  chatId: number
  message: Message
}

const createInitialMessagesObj = (chat: Chat): MessageList => ({
  messages: [
    {
      role: 'system',
      content: chat.prompt || '',
    },
  ],
})

const addUserMessageToMessagesObj = (
  messagesObj: MessageList,
  userMessageContent: string,
): void => {
  messagesObj.messages.push({
    role: 'user',
    content: userMessageContent || '',
  })
}

const addAssistantMessageToMessagesObj = (
  messagesObj: MessageList,
  assistantMessageContent: string,
): void => {
  messagesObj.messages.push({
    role: 'assistant',
    content: assistantMessageContent,
  })
}

const ChatAi = async (props: ChatAIInterface) => {
  const { chatId, message } = props
  const db = DB()
  const chatFromDb: Chat = await db.getMessages(chatId)
  let chat: Chat = chatFromDb || {
    chatId: chatId,
    message: message,
    temperature: 0.5,
    promptId: '1',
    prompt: 'You are a helpful assistant.',
  }

  let messagesObj: MessageList = chat.messages
    ? JSON.parse(chat.messages.toString())
    : createInitialMessagesObj(chat)

  addUserMessageToMessagesObj(messagesObj, message.content)

  chat.messages = messagesObj
  const api = await API()
  let returnedChat: any

  try {
    let returnedData = await api.chat(chat)
    returnedChat = returnedData.data.choices[0]
  } catch (error) {
    console.error('Error while communicating with OpenAI API:', error)
    throw error
  }

  addAssistantMessageToMessagesObj(chat.messages, returnedChat.message.content)

  db.addMessage({
    chatId: chat.chatId,
    messages: chat.messages,
    temperature: chat.temperature,
    promptId: chat.promptId || '1',
    prompt: chat.prompt || 'You are a helpful assistant.',
  })

  return returnedChat
}

export default ChatAi
