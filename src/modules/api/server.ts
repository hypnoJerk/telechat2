// axios server for openAI API
import axios from 'axios'
import AxiosRateLimit from 'axios-rate-limit'
import { MessageList, Chat, Message } from '../../types/chat'

interface ChatAPIInterface {
  chatId: number
  messages: MessageList
  temperature: number
  prompt: string
}

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
    let messages: Message[] = []

    if (!data.messages) {
      messages = [
        {
          role: 'system',
          content: data.prompt || '',
        },
        {
          role: 'user',
          content: data.message?.content || '',
        },
      ]
    } else {
      messages = data.messages.messages
      messages.push({
        role: 'user',
        content: data.message?.content || '',
      })
    }

    const requestData = {
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: data.temperature,
      user: data.chatId,
    }
    try {
      const response = await api.post(apiUrl, requestData, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      })
      return response
    } catch (error) {
      console.error('Error while communicating with OpenAI API:', error)
      throw error
    }
  }

  return {
    chat,
  }
}

export { API }
