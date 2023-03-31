import { message } from 'telegraf/filters'

const OnMessage = (bot: any) => {
  bot.on(message('text'), async (ctx: any) => {
    ctx.reply("I'm Alive...")
  })
}

export default OnMessage
