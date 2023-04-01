import { MessageList, Chat, Message } from '../../types/chat'
import { API } from '../../modules/api/server'
import DB from '../../modules/context/db'

// interface
interface ChatAIInterface {
  chatId: number
  message: Message
}

const ChatAi = async (props: ChatAIInterface) => {
  // TODO: Implement chat AI
  // Use the chatId to get the messages from the database
  // also get the promptId and temperature
  // set prompt with promptId
  // set temperature with temperature

  // Get the chat from the database
  const { chatId, message } = props
  const db = DB()
  const chatFromDb: Chat = await db.getMessages(chatId)
  let chat: Chat
  if (!chatFromDb) {
    chat = {
      chatId: chatId,
      message: message,
      temperature: 0.5,
      promptId: '1',
      prompt: 'You are a helpful assistant.',
    }
  } else {
    // const { messages, promptId, prompt, temperature } = chatFromDb
    chat = chatFromDb
  }

  const api = await API()
  let returnedChat: any
  try {
    let returnedData = await api.chat({
      chatId: chat.chatId,
      messages: chat.messages,
      message: chat.message,
      temperature: chat.temperature,
      promptId: chat.promptId,
      prompt: chat.prompt,
    })
    returnedChat = returnedData.data.choices[0]
  } catch (error) {
    console.error('Error while communicating with OpenAI API:', error)
    throw error
  }
  return returnedChat
}

export default ChatAi
