const RequiredCommands = (bot: any) => {
  bot.start((ctx: any) => ctx.reply('Welcome!'))
  bot.help((ctx: any) =>
    ctx.reply('This is a bot that uses GPT-3 to generate text.'),
  )
}

export default RequiredCommands
