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
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing')
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bot.on(message('photo'), CheckAccessMiddleware, async (ctx: any) => {
    const photo = ctx.message.photo[ctx.message.photo.length - 1]
    const caption = ctx.message.caption || ''

    // ctx.reply('I received a photo with the text: ' + caption)
    ctx.reply('One moment while I process the photo...')

    const file = await bot.telegram.getFileLink(photo.file_id)
    // console.log('file: ', file.href)
    // console.log('caption: ', caption)
    const chatRequest = {
      chatId: ctx.chat.id,
      message: {
        role: 'user',
        content: [
          {
            type: 'text',
            text: caption,
          },
          {
            type: 'image_url',
            image_url: {
              url: file.href,
              detail: 'low',
            },
          },
        ],
      },
    }
    const chatReply: Chat = await ChatAi(chatRequest)
    ctx.reply(chatReply.message.content, {
      parse_mode: 'HTML',
    })
  })
}

export default OnMessage
