import { MessageList, Chat, Message } from '../../types/chat'
import { API } from '../../modules/api/server'
import DB from '../../modules/context/db'

// interface
interface ChatAIInterface {
  chatId: number
  message: Message
}

const ChatAi = async (props: ChatAIInterface) => {
  // Use the chatId to get the messages from the database
  // also get the promptId and temperature
  // set prompt with promptId
  // set temperature with temperature

  // Get the chat from the database
  const { chatId, message } = props
  const db = DB()
  const chatFromDb: Chat = await db.getMessages(chatId)
  // console.log('chatFromDb: ', chatFromDb)
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
  // MessageList
  let messagesObj: MessageList
  // console.log('chat.messages: ', chat.messages)
  if (chat.messages !== undefined && chat.messages !== null) {
    messagesObj = JSON.parse(chat.messages.toString())
    // console.log('messagesObj: ', messagesObj)
    // console.log('messagesObj.messages: ', messagesObj.messages)
    messagesObj.messages.push({
      role: 'user',
      content: props.message.content || '',
    })
  } else {
    messagesObj = {
      messages: [
        {
          role: 'system',
          content: chat.prompt || '',
        },
        {
          role: 'user',
          content: chat.message?.content || '',
        },
      ],
    }
  }
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
  // push the returned message to the messages array
  chat.messages.messages.push({
    role: 'assistant',
    content: returnedChat.message.content,
  })

  // save to database
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
