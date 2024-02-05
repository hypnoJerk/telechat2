import Context from 'telegraf/typings/context'
import { Message } from '../../types/chat'
import CheckAccess from '../auth/checkAuthentication'
import ChatAi from '../context/chat'
import { message } from 'telegraf/filters'
//import the bot type from Telegraf
import { Telegraf } from 'telegraf'

// From types/chat
type Chat = {
  // chatId: number
  screenName: string
  message: Message
  // temperature: number
  // promptId: string
  // prompt: string
}

const OnMessage = (bot: Telegraf) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CheckAccessMiddleware = (ctx: Context, next: () => any) => {
    CheckAccess(bot, ctx, next)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bot.on(message('text'), CheckAccessMiddleware, async (ctx: any) => {
    if (ctx.message.text.length > 4096) {
      ctx.reply(
        'Your message exceeds the character limit of 4,096 characters. I may not be able to respond properly. Please shorten your message and try again, or use chat.openai.com directly.',
      )
      return
    }
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
