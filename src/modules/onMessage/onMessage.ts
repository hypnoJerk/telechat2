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
    const chatRequest = ChatAi(ctx)
    // set const chat: Chat
    const chat: Chat = await chatRequest
    ctx.reply(chat.message?.content)
    // ctx.reply("I'm Alive...")
  })
}

export default OnMessage
