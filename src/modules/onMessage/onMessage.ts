import Context from 'telegraf/typings/context'
import { Message } from '../../types/chat'
import CheckAccess from '../auth/checkAuthentication'
import ChatAi from '../context/chat'
import { message } from 'telegraf/filters'

// From types/chat
type Chat = {
  chatId: number
  screenName: string
  message: Message
  temperature: number
  promptId: string
  prompt: string
}

const OnMessage = (bot: any) => {
  const CheckAccessMiddleware = (ctx: Context, next: () => any) => {
    CheckAccess(bot, ctx, next)
  }
  bot.on(message('text'), CheckAccessMiddleware, async (ctx: any) => {
    const chatRequest = {
      chatId: ctx.chat.id,
      message: {
        role: 'user',
        content: ctx.message.text,
      },
    }
    const chatReply: Chat = await ChatAi(chatRequest)
    ctx.reply(`<b>${chatReply.screenName}</b>:  ` + chatReply.message.content, {
      parse_mode: 'HTML',
    })
  })
}

export default OnMessage
