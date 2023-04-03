import { MessageList, Chat, Message } from '../../types/chat'
import { API } from '../../modules/api/server'
import DB from '../../modules/context/db'
import CodeBlocksParse from '../parse/codeBlocksParse'
import PromptsObj from '../prompt/promptsObj'

interface ChatAIInterface {
  chatId: number
  message: Message
}

type ChatOut = {
  chatId: number
  screenName: string
  message: Message
  temperature: number
  promptId: string
  prompt: string
}

const createInitialMessagesObj = (): MessageList => ({
  messages: [],
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

const prependSystemMessageToMessagesObj = (
  messagesObj: MessageList,
  systemMessageContent: string = '',
): void => {
  messagesObj.messages.unshift({
    role: 'system',
    content: systemMessageContent,
  })
}

const removeSystemMessageFromMessagesObj = (messagesObj: MessageList): void => {
  if (
    messagesObj.messages.length > 0 &&
    messagesObj.messages[0].role === 'system'
  ) {
    messagesObj.messages.shift()
  }
}

const removeTopHistoryFromMessagesObj = (
  messagesObj: MessageList,
  limit: number,
): void => {
  if (messagesObj.messages.length > limit) {
    messagesObj.messages = messagesObj.messages.slice(
      messagesObj.messages.length - limit,
    )
  }
}

const ChatAi = async (props: ChatAIInterface) => {
  const { chatId, message } = props
  const db = DB()
  const chatFromDb: Chat = await db.getMessages(chatId)
  let chat: Chat = chatFromDb || {
    chatId: chatId,
    message: message,
    temperature: 0.5,
    promptId: 'default',
    prompt: 'You are a helpful assistant.',
  }

  let messagesObj: MessageList = chat.messages
    ? JSON.parse(chat.messages.toString())
    : createInitialMessagesObj()

  addUserMessageToMessagesObj(messagesObj, message.content)

  // Prepend the system message before sending to the chat API
  prependSystemMessageToMessagesObj(messagesObj, chat.prompt)

  chat.messages = messagesObj
  const api = await API()
  let returnedChat: any
  let returnedChatMessage: any

  try {
    console.log('Sending chat to OpenAI API:', chat)
    let returnedData = await api.chat(chat)
    returnedChat = returnedData.data.choices[0]
    returnedChatMessage = returnedChat.message
    const promptId = chat.promptId || 'default'
    const screenName = PromptsObj()[promptId].screenName || 'default'
    returnedChat.screenName = screenName
    // returnedChat.message.content = CodeBlocksParse(returnedChatMessage.content)
    // const parsedMessage = CodeBlocksParse(returnedChatMessage.content)
    // returnedChat.message.content = parsedMessage
  } catch (error) {
    console.error('Error while communicating with OpenAI API:', error)
    throw error
  }

  addAssistantMessageToMessagesObj(chat.messages, returnedChat.message.content)

  // Remove the system message before saving to the database
  removeSystemMessageFromMessagesObj(chat.messages)
  // Remove the top history to keep the chat history to a reasonable size
  removeTopHistoryFromMessagesObj(chat.messages, 6)

  db.addMessage({
    chatId: chat.chatId,
    messages: chat.messages,
    temperature: chat.temperature,
    promptId: chat.promptId || 'default',
    prompt: chat.prompt || 'You are a helpful assistant.',
  })

  // Modify the returnedChat object to include the parsed message
  const parsedMessage = CodeBlocksParse(returnedChatMessage.content)
  const parsedReturnedChat = {
    ...returnedChat,
    message: {
      ...returnedChat.message,
      content: parsedMessage,
    },
  }

  // Return the modified returnedChat object with parsed code blocks
  return parsedReturnedChat
}

export default ChatAi
