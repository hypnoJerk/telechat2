import Context from 'telegraf/typings/context'
import Prompt from '../../modules/prompt/prompt'
import PromptsObj from '../prompt/promptsObj'
import CheckAccess from '../auth/checkAuthentication'
// import { message } from 'telegraf/filters'

const CustomCommands = (bot: any) => {
  const CheckAccessMiddleware = (ctx: Context, next: () => any) => {
    CheckAccess(bot, ctx, next)
  }
  bot.command(['prompt', 'p'], CheckAccessMiddleware, (ctx: any) => {
    const args = ctx.message.text.split(' ')
    const promptId = args[1].toLowerCase()
    const prompt = Prompt({
      chatId: ctx.chat.id,
      promptId: promptId,
      // prompt: 'You are a helpful assistant.',
    }).setPrompt()
    if (
      prompt.prompt ===
      'Please enter a valid prompt argument.\n\n Example:\n /prompt snoopdogg \n\nTo see a list of available prompts use the /list command.'
    ) {
      ctx.reply(prompt.prompt)
      return
    }
    const name = PromptsObj()[promptId].name
    ctx.reply(
      `Prompt set to ${prompt.promptId}\n\nYou are now chatting with ${name}! Say hi!`,
    )
  })

  // prompt reset
  // /reset
  bot.command(['reset', 'r'], CheckAccessMiddleware, (ctx: any) => {
    const prompt = Prompt({
      chatId: ctx.chat.id,
      promptId: 'default',
      // prompt: 'You are a helpful assistant.',
    }).setPrompt()
    ctx.reply(
      'Prompt set to ' +
        prompt.promptId +
        '. Chat history and personality reset. Say hi!',
    )
  })
}

export default CustomCommands
