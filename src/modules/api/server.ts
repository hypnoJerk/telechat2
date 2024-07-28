// axios server for openAI API
import axios, { AxiosError } from 'axios'
import AxiosRateLimit from 'axios-rate-limit'
import { Chat } from '../../types/chat'
import PromptsObj from '../prompt/promptsObj'
import logger from '../logger/logger'

// interface ChatAPIInterface {
//   chatId: number
//   messages: MessageList
//   temperature: number
//   prompt: string
// }

const API = async () => {
  const api = AxiosRateLimit(axios.create(), {
    maxRequests: 1,
    perMilliseconds: 1000,
    maxRPS: 1,
  })
  const apiUrl = 'https://api.openai.com/v1/chat/completions'
  const apiKey = process.env.GPT_TOKEN

  if (!apiKey) {
    throw new Error('GPT_TOKEN is not set in the environment variables.')
  }

  const authHeader = `Bearer ${apiKey}`

  async function chat(data: Chat) {
    if (!data) {
      throw new Error('No data provided')
    }

    // get model from promptsObj based on promptId

    const promptsObj = PromptsObj()

    const requestData = {
      model: data.model,
      messages: data.messages?.messages,
      temperature: data.temperature,
      user: data.chatId.toString(),
      max_tokens: 2000,
      tools: data.tools,
      tool_choice: data.tool_choice,
    }
    if (!data.model || data.model.length > 3) {
      requestData.model = 'gpt-4o-mini'
    }
    // console.log('requestData: ', requestData)
    // console.log('messages: ', data.messages?.messages)

    // / if any messages in data has an image, send to vision model
    // const model = data.model
    if (data.messages?.messages) {
      // check if message.content is an array
      const lastMessage =
        data.messages?.messages[data.messages?.messages.length - 1]
      logger.info({
        chatId: data.chatId.toString(),
        lastMessage: lastMessage,
      })
      // console.log('lastMessage: ', lastMessage)
      if (Array.isArray(lastMessage?.content)) {
        const lastContent = lastMessage.content[lastMessage.content.length - 1]
        logger.info({
          chatId: data.chatId.toString(),
          lastContent: lastContent,
        })
        // console.log('lastContent: ', lastContent)
        if (lastContent.type === 'image_url') {
          logger.info({
            chatId: data.chatId.toString(),
            lastContentType: lastContent.type,
          })
          // only include last message, remove all other messages
          requestData.messages = [lastMessage]
          console.log('lastContent.type: ', lastContent.type)
          requestData.model = 'gpt-4o'
          requestData.max_tokens = 500
        }
      }
    }
    try {
      const response = await api
        .post(apiUrl, requestData, {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          const promptId = data.promptId // Ensure promptId is defined
          if (promptId === undefined) {
            throw new Error('Prompt ID is not defined')
          } else if (response.data.model === 'gpt-4o') {
            response.data.model = promptsObj[promptId].model
            // console.log('response.data.model: ', response.data.model)
          }
          return response
        })
      return response
    } catch (error) {
      const axiosError = error as AxiosError
      const errorMessage = axiosError.response?.data as {
        error: {
          message: string
          type: string
          param: string
          code: string
        }
      }
      const errorMessageText = errorMessage.error.message ?? ''
      logger.error({
        // timestamp: timestamp,
        chatId: data.chatId.toString(),
        // systemPrompt: arg,
        error:
          ' status: ' +
          axiosError.response?.status +
          ' statusText: ' +
          axiosError.response?.statusText,
      })
      console.error(
        'Error while communicating with OpenAI API:',
        errorMessageText,
      )
      // throw error
    }
  }

  return {
    chat,
  }
}

export { API }
