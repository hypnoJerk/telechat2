const RequiredCommands = (bot: any) => {
  bot.start((ctx: any) =>
    ctx.reply(
      `Hello, ${ctx.from.first_name}! This is a Telegram bot, \npowered by OpenAI's GPT-3, \nand developed by hypno. \n\nTo get started, type /help or use the /prompt command to set the prompt for the bot or just start chatting to chat with default ChatGPT. \n\nExamples:\n/prompt snoopdogg \n/p wizard\n/prompt default\n\nSee /list for available prompts.`,
    ),
  )
  bot.help((ctx: any) =>
    ctx.reply(
      'Here are some commands you can use:\n/start - Start the bot\n/help - Show help\n/prompt or /p - Set the prompt for the bot. \n eg: /p wizard\n/reset - Reset the Personality\n/list - List all available prompts \n/list_detailed - List all available prompts with descriptions \n/details - Get details about a prompt. \n eg: /details wizard\n\nTo get started, use the /prompt command to set the prompt for the bot or just start chatting to chat with default ChatGPT. \n\nExamples:\n/prompt snoopdogg \n/p wizard\n/prompt default\n\nHave fun!',
    ),
  )
}

export default RequiredCommands
