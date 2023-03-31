//////////////////////////////////////
// Path: src/index.ts               //
// Telegram Telegraf Typescript Bot //
// Powered by openAI API GPT-3      //
// Author: Shaun Hallier @hypnojerk //
//////////////////////////////////////
// Imports
import { Telegraf, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import { DateTime } from 'luxon'
import { API } from './modules/api/server'
// import modules
import RequiredCommands from './modules/commands/requiredCommands'
import CustomCommands from './modules/commands/customCommands'
import OnMessage from './modules/onMessage/onMessage'

// Initiating bot
console.log('Initiating bot...')
const now = DateTime.local()

require('dotenv').config()
// Check for environment variables
if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not defined')
}
if (!process.env.TELE_CHAT_ID) {
  throw new Error('TELE_CHAT_ID is not defined')
}

// Config Server
const api = API()

const bot = new Telegraf(process.env.BOT_TOKEN)

// Module - Commands
RequiredCommands(bot)

// Module - customCommands
CustomCommands(bot)

// Module - onMessage - Chat
OnMessage(bot)

// Start bot
console.log('Starting bot...')
bot.launch()
console.log('Bot started at ' + now.toLocaleString(DateTime.DATETIME_MED))

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
