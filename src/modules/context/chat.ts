import { MessageList, Chat, Message } from '../../types/chat'
import { API } from '../../modules/api/server'
import DB from '../../modules/context/db'
import CodeBlocksParse from '../parse/codeBlocksParse'
import PromptsObj from '../prompt/promptsObj'
import logger from '../logger/logger'
import { encode } from 'gpt-3-encoder'
import { DateTime } from 'luxon'

const now = DateTime.local()

interface ChatAIInterface {
  chatId: number
  message: Message
}

type ReturnedChat = {
  id: string
  object: string
  created: number
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  choices: [
    {
      message: Message
      finish_reason: string
      index: number
    },
  ]
  screenName: string
}

// type ChatOut = {
//   chatId: number
//   screenName: string
//   message: Message
//   temperature: number
//   promptId: string
//   prompt: string
// }

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
  systemMessageContent = '',
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
  const chat: Chat = chatFromDb || {
    chatId: chatId,
    message: message,
    temperature: 0.5,
    promptId: 'default',
    prompt: 'You are a helpful assistant.',
    promptLimit: 6,
  }

  const messagesObj: MessageList = chat.messages
    ? JSON.parse(chat.messages.toString())
    : createInitialMessagesObj()

  addUserMessageToMessagesObj(messagesObj, message.content)

  // Prepend the system message before sending to the chat API
  prependSystemMessageToMessagesObj(messagesObj, chat.prompt)

  chat.messages = messagesObj

  function calculateMessageCost(tokens: number): number {
    const ratePerThousand = 0.002
    const ratePerToken: number = ratePerThousand / 1000
    let cost: number = tokens * ratePerToken
    cost = Math.round(cost * 100000) / 100000
    return cost
  }
  const concatMessages = (messages: Message[]): string => {
    let allMessages = ''
    messages.forEach((message: Message) => {
      allMessages += message.content + ' '
    })
    return allMessages
  }
  const allMessage = concatMessages(messagesObj.messages)
  const tokenizedRequest = encode(allMessage)
  const requestCost = calculateMessageCost(tokenizedRequest.length)
  logger.info({
    timestamp: now.toFormat('yyyy-MM-dd HH:mm:ss'),
    chatId: chatId,
    prompt: chat.promptId,
    promptLimit: chat.promptLimit,
    message: {
      type: 'input',
      text: {
        chars_original: message.content.length,
        chars: allMessage.length,
        token: tokenizedRequest.length,
        cost: requestCost,
      },
    },
  })

  const api = await API()
  let returnedChat: ReturnedChat
  let returnedChatMessage: Message

  try {
    // console.log('Sending chat to OpenAI API:', chat)
    const returnedData = await api.chat(chat)
    // console.log('Received chat from OpenAI API:', returnedData)
    // console.log('Returned Chat returnedChat: ', returnedData.data.choices[0])
    returnedChat = returnedData.data
    returnedChatMessage = returnedChat.choices[0].message
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

  addAssistantMessageToMessagesObj(
    chat.messages,
    returnedChat.choices[0].message.content,
  )

  // Remove the system message before saving to the database
  removeSystemMessageFromMessagesObj(chat.messages)
  // Remove the top history to keep the chat history to a reasonable size
  removeTopHistoryFromMessagesObj(chat.messages, chat.promptLimit)
  // console.log('chat.ts - db.addMessage - chat.promptLimit: ', chat.promptLimit)
  db.addMessage({
    chatId: chat.chatId,
    messages: chat.messages,
    temperature: chat.temperature,
    promptId: chat.promptId || 'default',
    prompt: chat.prompt || 'You are a helpful assistant.',
    promptLimit: chat.promptLimit,
    model: chat.model,
  })

  const tokenizedResponse = encode(returnedChatMessage.content)
  const responseCost = calculateMessageCost(tokenizedResponse.length)
  logger.info({
    timestamp: now.toFormat('yyyy-MM-dd HH:mm:ss'),
    chatId: chatId,
    // systemPrompt: arg,
    message: {
      type: 'output',
      text: {
        chars_original: returnedChatMessage.content.length,
        chars: returnedChatMessage.content.length,
        token: tokenizedResponse.length,
        cost: responseCost,
      },
    },
  })

  // Modify the returnedChat object to include the parsed message
  const parsedMessage = CodeBlocksParse(returnedChatMessage.content)
  const parsedReturnedChat = {
    ...returnedChat,
    message: {
      ...returnedChat.choices[0].message,
      content: parsedMessage,
    },
  }

  // Return the modified returnedChat object with parsed code blocks
  return parsedReturnedChat
}

export default ChatAi
