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
    // let messages: Message[]

    // get model from promptsObj based on promptId

    const promptsObj = PromptsObj()

    // promptsObj['jessica'].model

    const requestData = {
      // model: 'gpt-3.5-turbo',
      model: data.model,
      messages: data.messages?.messages,
      temperature: data.temperature,
      user: data.chatId.toString(),
    }
    // console.log('requestData: ', requestData)
    // console.log('messages: ', data.messages?.messages)
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
          }
          response.data.model = promptsObj[promptId].model
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
      throw error
    }
  }

  return {
    chat,
  }
}

export { API }
