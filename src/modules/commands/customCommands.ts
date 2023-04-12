import Context from 'telegraf/typings/context'
import Prompt from '../../modules/prompt/prompt'
import PromptsObj from '../prompt/promptsObj'
import CheckAccess from '../auth/checkAuthentication'
// import { message } from 'telegraf/filters'

const CustomCommands = (bot: any) => {
  const CheckAccessMiddleware = (ctx: Context, next: () => any) => {
    CheckAccess(bot, ctx, next)
  }

  // prompt
  // /prompt or /p

  bot.command(['prompt', 'p'], CheckAccessMiddleware, (ctx: any) => {
    const args = ctx.message.text.split(' ')
    let promptId = args[1].toLowerCase()
    if (promptId === 'chatgpt' || promptId === 'chat' || promptId === 'gpt') {
      promptId = 'default'
    }
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
    } else {
      const name = PromptsObj()[promptId].name || 'a helpful assistant'
      ctx.reply(
        `Prompt set to ${prompt.promptId}\n\nYou are now chatting with ${name}! Say hi!`,
      )
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

  // list_detailed
  // /list_detailed
  bot.command('list_detailed', CheckAccessMiddleware, (ctx: any) => {
    const prompts = PromptsObj()
    // remove prompts that have hidden: true
    for (const key in prompts) {
      if (prompts[key].hidden) {
        delete prompts[key]
      }
    }
    // reply with a formatted list of prompts with their descriptions
    let reply = ''
    // remove prompts that have hidden: true
    for (const key in prompts) {
      if (prompts[key].hidden === true) {
        delete prompts[key]
      }
    }
    for (const key in prompts) {
      reply += `<b>${key}</b> - ${prompts[key].description} \n\n`
    }
    ctx.reply('<b>Here is a detailed list of prompts:</b>\n\n' + reply, {
      parse_mode: 'HTML',
    })
  })

  // details
  // /details

  bot.command('details', CheckAccessMiddleware, (ctx: any) => {
    // take argument and return details about the prompt
    const args = ctx.update.message.text.split(' ')
    const prompts = PromptsObj()

    if (args.length > 1) {
      // args[1] must match a key in the prompts module
      // check for match
      const argLower = args[1].toLowerCase()
      if (prompts[argLower] === undefined) {
        ctx.reply(
          'Please enter a valid prompt argument.\n\n Example:\n /details snoopdogg \n\nTo see a list of available prompts use the /list command.',
        )
        return
      }
      const details = prompts[argLower]
      const reply = `Name: ${details.name}\nDescription: ${details.description}\nScreen Name: ${details.screenName}`
      ctx.reply(reply, { parse_mode: 'HTML' })
    } else {
      ctx.reply(
        'Please enter a valid prompt argument.\n\n Example:\n /details snoopdogg \n\nTo see a list of available prompts use the /list command.',
      )
    }
  })
}

export default CustomCommands
