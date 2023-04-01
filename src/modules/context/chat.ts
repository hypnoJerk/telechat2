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

  if (!chatFromDb) {
    throw new Error('No chat found')
  }
  const { messages, promptId, prompt, temperature } = chatFromDb

  const api = await API()
  let returnedChat: any
  try {
    let returnedData = await api.chat({
      chatId: chatId,
      messages: messages,
      message: message,
      temperature: temperature,
      promptId: promptId,
      prompt: prompt,
    })
    returnedChat = returnedData.data.choices[0]
  } catch (error) {
    console.error('Error while communicating with OpenAI API:', error)
    throw error
  }
  return returnedChat
}

export default ChatAi
