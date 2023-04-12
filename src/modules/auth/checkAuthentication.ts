import { Context, Telegraf } from 'telegraf'
import FileUsers from './fileUser'
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram'
import { callbackQuery } from 'telegraf/filters'

function createAccessRequestKeyboard(
  userId: number,
  firstName: string,
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: 'Allow',
          callback_data: `allow-${userId}-${firstName}`,
        },
        {
          text: 'Deny',
          callback_data: `deny-${userId}-${firstName}`,
        },
      ],
    ],
  }
}

const CheckAccess = async (bot: Telegraf, ctx: Context, next: () => any) => {
  const chatId = process.env.TELE_CHAT_ID as string
  if (!ctx.from) {
    return
  }
  const userId = ctx.from.id
  const userExists = FileUsers().checkUser(userId.toString())
  // console.log('userExists ', userExists)
  // console.log('userId ', userId.toString())
  if (userExists) {
    // User is allowed, continue with the next middleware
    return next()
  } else {
    bot.on(callbackQuery('data'), async (ctx: Context) => {
      const callbackQuery = ctx.callbackQuery

      if (callbackQuery && 'data' in callbackQuery && callbackQuery.from) {
        const admin = callbackQuery.from.first_name
        const [action, userId, firstName] = callbackQuery.data.split('-')

        if (action === 'allow') {
          FileUsers().addUser(userId)
          await ctx.answerCbQuery(`${admin} allowed access to user ${userId}.`)
          await bot.telegram.sendMessage(
            chatId,
            `${ctx.from?.username} (${ctx.from?.first_name}) has granted access to ${firstName} ( UserId: ${userId}`,
          )
          await bot.telegram.sendMessage(
            userId,
            `Hello ${firstName}! You've been Granted Access!`,
          )
        } else if (action === 'deny') {
          const checkUser = FileUsers().checkUser(userId)
          if (checkUser) {
            FileUsers().removeUser(userId)
          }
          await ctx.answerCbQuery(`${admin} denied access to user ${userId}.`)
        } else {
          await ctx.answerCbQuery('Error: Invalid action.')
        }
      } else {
        await ctx.answerCbQuery('Error: Cannot retrieve callback query data.')
      }
    })

    await bot.telegram.sendMessage(
      chatId,
      `Hello! ${ctx.from.username} (${ctx.from.first_name}) is requesting access.`,
      {
        reply_markup: createAccessRequestKeyboard(userId, ctx.from.first_name),
      },
    )
    // User is not allowed, send an error message
    return ctx.reply(
      'Sorry, you are not allowed to access this bot. Please wait for access to be granted.',
    )
  }
}

export default CheckAccess
