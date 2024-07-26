import { MessageList, Chat, Message, Content } from '../../types/chat'
import { API } from '../../modules/api/server'
import DB from '../../modules/context/db'
import Memory from './db-memory'
import CodeBlocksParse from '../parse/codeBlocksParse'
import PromptsObj from '../prompt/promptsObj'
import logger from '../logger/logger'
import { encode } from 'gpt-3-encoder'
import { DateTime } from 'luxon'
import tools from '../context/tools'

const now = DateTime.local()
const memory = Memory()

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
  userMessageContent: Content,
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

const addFunctionMessageToMessagesObj = (
  messagesObj: MessageList,
  assistantMessageContent: string,
  name: string,
): void => {
  messagesObj.messages.push({
    role: 'function',
    name: name,
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
    model: 'gpt-4o-mini',
  }

  const messagesObj: MessageList = chat.messages
    ? JSON.parse(chat.messages.toString())
    : createInitialMessagesObj()

  addUserMessageToMessagesObj(messagesObj, message.content as Content)

  // Prepend the system message before sending to the chat API
  prependSystemMessageToMessagesObj(messagesObj, chat.prompt)

  // add tools and tool_choice to the chat object

  chat.messages = messagesObj
  chat.tools = tools
  chat.tool_choice = 'auto'

  function toolsAddReturnedChatMessage(
    returnedChat: ReturnedChat,
    message: string,
    name: string,
  ) {
    if (returnedChat) {
      addFunctionMessageToMessagesObj(
        chat.messages as MessageList,
        message,
        name,
      )
      returnedChat.choices[0].message.content = message
    }
  }

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
    promptTemperature: chat.temperature,
    promptModel: chat.model,
    message: {
      type: 'input',
      text: {
        chars_original:
          typeof message.content === 'string' ? message.content.length : 0,
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
    chat.tool_choice = 'auto'
    // console.log('Sending chat to OpenAI API:', chat)
    const returnedData = await api.chat(chat)
    // console.log('Received chat from OpenAI API:', returnedData)
    // console.log('Returned Chat returnedChat: ', returnedData?.data.choices[0])
    returnedChat = returnedData?.data
    returnedChatMessage = returnedChat.choices[0].message

    // returnedChat.message.content = CodeBlocksParse(returnedChatMessage.content)
    // const parsedMessage = CodeBlocksParse(returnedChatMessage.content)
    // returnedChat.message.content = parsedMessage

    // if returnedChatMessage.tool_calls in not empty, then call functions in the tool_calls
    if (returnedChatMessage.tool_calls) {
      for (const tool_call of returnedChatMessage.tool_calls) {
        if (tool_call.function.name === 'get_time') {
          const now = DateTime.local()
          const time = now.toFormat('MM-dd-yyyy hh:mm:ss a')
          const currentTime = `The current time is ${time}.`
          toolsAddReturnedChatMessage(
            returnedChat,
            currentTime,
            tool_call.function.name,
          )
        } else if (tool_call.function.name === 'get_profile') {
          const returnedProfile = await memory.getProfile(chatId)
          if (returnedProfile) {
            const profile = JSON.stringify(returnedProfile)
            toolsAddReturnedChatMessage(
              returnedChat,
              profile,
              tool_call.function.name,
            )
          }
        } else if (tool_call.function.name === 'add_to_profile') {
          const args = JSON.parse(tool_call.function.arguments)
          memory.addToProfile({
            chatId: chatId,
            name: args.name,
            nickname: args.nickname,
            s: args.s,
            pronouns: args.pronouns,
            age: args.age,
            location: args.location,
          })
          toolsAddReturnedChatMessage(
            returnedChat,
            'Added to profile.',
            tool_call.function.name,
          )
        } else if (tool_call.function.name === 'add_new_memory') {
          memory.addNewMemory({
            chatId: chatId,
            promptId: chat.promptId || 'default',
            memory: tool_call.function.arguments,
            datetime: now.toFormat('yyyy-MM-dd HH:mm:ss'),
          })
          toolsAddReturnedChatMessage(
            returnedChat,
            'Saved new memory.',
            tool_call.function.name,
          )
        } else if (tool_call.function.name === 'get_memory') {
          const returnedMemory = await memory.getMemory(
            chatId,
            chat.promptId || 'default',
          )
          if (returnedMemory) {
            const data = returnedMemory.map(
              (item: { memory: string; datetime: string }) => ({
                memory: item.memory,
                datetime: item.datetime,
              }),
            )
            const memory = JSON.stringify(data)
            toolsAddReturnedChatMessage(
              returnedChat,
              memory,
              tool_call.function.name,
            )
          }
        } else if (tool_call.function.name === 'delete_profile') {
          memory.deleteProfile(chatId)
          toolsAddReturnedChatMessage(
            returnedChat,
            'The profile has been deleted.',
            tool_call.function.name,
          )
        } else if (tool_call.function.name === 'delete_memory') {
          memory.deleteMemories(chatId, chat.promptId || '')
          toolsAddReturnedChatMessage(
            returnedChat,
            'All memories have been deleted.',
            tool_call.function.name,
          )
        }
      }
      chat.tool_choice = 'none'
      try {
        console.log(chat.messages)
        const toolReturnedData = await api.chat(chat)
        console.log(
          'Tool Return: Response from OpenAI API:',
          toolReturnedData?.data.choices[0],
        )
        console.log(
          'Tool Return: tool_calls:',
          toolReturnedData?.data.choices[0].message.tool_calls,
        )
        returnedChat = toolReturnedData?.data
        returnedChatMessage = returnedChat.choices[0].message

        if (returnedChat.choices[0].message.content) {
          addAssistantMessageToMessagesObj(
            chat.messages,
            returnedChat.choices[0].message.content.toString(),
          )
        }
      } catch (error) {
        console.error('Error while communicating with OpenAI API:', error)
        throw error
      }
    } else {
      chat.tool_choice = 'auto'
      if (returnedChat.choices[0].message.content) {
        addAssistantMessageToMessagesObj(
          chat.messages,
          returnedChat.choices[0].message.content.toString(),
        )
      }
    }
  } catch (error) {
    console.error('Error while communicating with OpenAI API:', error)
    throw error
  }

  const promptId = chat.promptId || 'default'
  const screenName = PromptsObj()[promptId].screenName || 'default'
  returnedChat.screenName = screenName

  // if (returnedChat.choices[0].message.content) {
  //   addAssistantMessageToMessagesObj(
  //     chat.messages,
  //     returnedChat.choices[0].message.content.toString(),
  //   )
  // }

  // Remove the system message before saving to the database
  removeSystemMessageFromMessagesObj(chat.messages)
  // Remove the top history to keep the chat history to a reasonable size
  removeTopHistoryFromMessagesObj(chat.messages, chat.promptLimit)
  // console.log('chat.ts - db.addMessage - chat.promptLimit: ', chat.promptLimit)

  // Create a function that parses the messages and changes the image_url to a text placeholder
  function transformMessages(messagesList: MessageList): MessageList {
    const transformedMessages: Message[] = messagesList.messages.map(
      (message) => {
        // Check if content is an array and needs transformation
        if (Array.isArray(message.content)) {
          // Map over the content array to transform image_url objects
          const transformedContent: Content[] = message.content.map(
            (contentItem) => {
              if (contentItem.type === 'image_url') {
                // Change type to 'text' and replace image_url with a placeholder text
                return { type: 'text', text: 'image placeholder here' }
              }
              return contentItem
            },
          )
          return { ...message, content: transformedContent }
        }
        // Return the message unmodified if it doesn't meet the criteria
        return message
      },
    )

    return { messages: transformedMessages }
  }
  const parsedMessages = transformMessages(chat.messages)
  db.addMessage({
    chatId: chat.chatId,
    messages: parsedMessages,
    temperature: chat.temperature,
    promptId: chat.promptId || 'default',
    prompt: chat.prompt || 'You are a helpful assistant.',
    promptLimit: chat.promptLimit,
    model: chat.model,
  })
  const tokenizedResponse = encode(
    returnedChatMessage.content?.toString() || '',
  )
  const responseCost = calculateMessageCost(tokenizedResponse.length)
  logger.info({
    timestamp: now.toFormat('yyyy-MM-dd HH:mm:ss'),
    chatId: chatId,
    // systemPrompt: arg,
    message: {
      type: 'output',
      text: {
        chars_original:
          typeof returnedChatMessage.content === 'string'
            ? returnedChatMessage.content.length
            : 0,
        chars:
          typeof returnedChatMessage.content === 'string'
            ? returnedChatMessage.content.length
            : 0,
        token: tokenizedResponse.length,
        cost: responseCost,
      },
    },
  })

  // Modify the returnedChat object to include the parsed message
  const parsedMessage = CodeBlocksParse(
    returnedChatMessage.content?.toString() || '',
  )
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
