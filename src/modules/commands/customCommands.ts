import Prompt from '../../modules/prompt/prompt'
// import { message } from 'telegraf/filters'

const CustomCommands = (bot: any) => {
  bot.command(['prompt', 'p'], (ctx: any) => {
    const prompt = Prompt({
      chatId: ctx.chat.id,
      promptId: ctx.message.text.split(' ')[1],
      // prompt: 'You are a helpful assistant.',
    }).setPrompt()

    ctx.reply('Prompt set to ' + prompt.promptId)
  })
}

export default CustomCommands
