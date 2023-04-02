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
    const chatRequest = {
      chatId: ctx.chat.id,
      message: {
        role: 'user',
        content: ctx.message.text,
      },
      promptId: '1',
    }
    const chatReply = await ChatAi(chatRequest)
    ctx.reply(chatReply.message.content)
  })
}

export default OnMessage
