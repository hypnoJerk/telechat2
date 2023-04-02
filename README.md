# telechat2

# Telegram Bot

This is a telegram bot that uses the GPT-3 API to generate text. It is a work in progress.

## How to use

1. Create a telegram bot and get the token
2. Create a GPT-3 API key
3. Create a .env file and add the following variables

```bash

# Path: .env
# .env file
# This file should be used to store environment variables on your local machine.
# Do not commit this file to source control.

BOT_TOKEN=your_bot_token_here
GPT_TOKEN= your_gpt_token_here
TELE_CHANNEL= "your channel id here"
TELE_CHAT_ID= "your chat id here"

```

4. Run the bot

```bash
node index.js
```
