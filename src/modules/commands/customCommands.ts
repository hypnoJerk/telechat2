import Context from 'telegraf/typings/context'
import Prompt from '../../modules/prompt/prompt'
import CheckAccess from '../auth/checkAuthentication'
// import { message } from 'telegraf/filters'

const CustomCommands = (bot: any) => {
  const CheckAccessMiddleware = (ctx: Context, next: () => any) => {
    CheckAccess(bot, ctx, next)
  }
  bot.command(['prompt', 'p'], CheckAccessMiddleware, (ctx: any) => {
    const prompt = Prompt({
      chatId: ctx.chat.id,
      promptId: ctx.message.text.split(' ')[1],
      // prompt: 'You are a helpful assistant.',
    }).setPrompt()
    if (prompt.prompt === 'That prompt does not exist.') {
      ctx.reply(prompt.prompt)
      return
    }
    ctx.reply('Prompt set to ' + prompt.promptId)
  })
}

export default CustomCommands
