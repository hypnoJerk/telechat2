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
      // console.log('this ran :o')
      ctx.reply(prompt.prompt)
      return
    } else {
      const name = PromptsObj()[promptId].name || 'a helpful assistant'
      ctx.reply(
        `Prompt set to ${prompt.promptId}\n\nYou are now chatting with ${name}! Say hi!`,
      )
      console.log('this just ran :o')
    }
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

  // list prompts
  // /list
  bot.command(['list', 'l'], CheckAccessMiddleware, (ctx: any) => {
    const prompts = PromptsObj()
    // remove prompts that have hidden: true
    for (const key in prompts) {
      if (prompts[key].hidden) {
        delete prompts[key]
      }
    }
    let list = ''
    for (const key in prompts) {
      list += `${key}: ${prompts[key].name}\n`
    }
    ctx.reply(
      'Here are the available prompts:\n\n' +
        list +
        '\n\nTo set a prompt use the /prompt command.\neg: /p snoopdogg\n\nTo get details about a prompt use the /details command.\neg: /details wizard. \n\nTo see a detailed list of prompts use the /list_detailed command.',
    )
  })
}

export default CustomCommands
