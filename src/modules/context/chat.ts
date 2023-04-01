import { MessageList, Chat, Message } from '../../types/chat'
import { API } from '../../modules/api/server'

const ChatAi = async (chat: Chat) => {
  // TODO: Implement chat AI
  // Use the chatId to get the messages from the database
  // also get the promptId and temperature
  // set prompt with promptId
  // set temperature with temperature
  const api = await API()
  const { chatId, messages, message, promptId, prompt, temperature } = chat
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
