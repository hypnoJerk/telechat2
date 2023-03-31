// import { message } from 'telegraf/filters'

const CustomCommands = (bot: any) => {
  bot.command(['prompt', 'p'], (ctx: any) => {
    ctx.reply('Prompt...')
  })
}

export default CustomCommands
