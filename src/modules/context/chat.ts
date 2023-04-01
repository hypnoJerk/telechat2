import { MessageList, Chat, Message } from '../../types/chat'
import { API } from '../../modules/api/server'

const ChatAi = async (chat: Chat) => {
  // TODO: Implement chat AI
  // Use the chatId to get the messages from the database
  // also get the promptId and temperature
  // set prompt with promptId
  // set temperature with temperature
  const api = await API()
  const { chatId, messages, promptId, prompt, temperature } = chat

  try {
    const returnedData = await api.chat({
      chatId,
      messages,
      promptId,
      prompt,
      temperature,
    })
    const returnedChat: Chat = returnedData.request.data
    chat = returnedChat
  } catch (error) {
    console.error('Error while communicating with OpenAI API:', error)
    throw error
  }
  return chat
}

export default ChatAi
