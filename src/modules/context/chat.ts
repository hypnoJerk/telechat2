import { MessageList, Chat, Message } from '../../types/chat'
import { API } from '../../modules/api/server'

const ChatAi = (chat: Chat) => {
  // TODO: Implement chat AI
  // Use the chatId to get the messages from the database
  // also get the promptId and temperature
  // set prompt with promptId
  // set temperature with temperature
  const api = API()
  const { chatId, messages, promptId, prompt, temperature } = chat

  const returnedData = api.chat({
    chatId,
    messages,
    promptId,
    prompt,
    temperature,
  })

  return chat
}

export default ChatAi
