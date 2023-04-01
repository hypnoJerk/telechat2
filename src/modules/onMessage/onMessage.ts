import { Chat } from '../../types/chat'
import ChatAi from '../context/chat'
import { message } from 'telegraf/filters'

// From types/chat
// type Chat = {
//   chatId: number
//   messages?: MessageListInterface
//   message?: Message
//   temperature: number
//   promptId?: string
//   prompt?: string
// }

const OnMessage = (bot: any) => {
  bot.on(message('text'), async (ctx: any) => {
    const chatReq: Chat = {
      chatId: ctx.chat.id,
      message: {
        role: 'user',
        content: ctx.message.text,
      },
      temperature: 0.5,
      promptId: '1',
      prompt: 'You are a helpful assistant.',
    }
    const chatReply = await ChatAi(chatReq)
    ctx.reply(chatReply.message.content)
  })
}

export default OnMessage
