# telechat2

# Telegram Bot

This is a telegram bot that uses the GPT-3.5 & GPT-4 API to generate text. It is a work in progress.

## How to use

1. Install the dependencies

```bash
yarn install
```

2. Build the project with typescript TSC. The output should be in the dist directory

```bash
tsc
```

3. Create a telegram bot and get the token
4. Create an API key from [OpenAI](https://platform.openai.com/api-keys)
5. Create a .env file and add the following variables

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

6. Create a file called users.txt and add the telegram user ids of the users you want to allow to use the bot (will use database in the future)

```txt
# Path: users.txt
# users.txt file
# This file should be used to store the telegram user ids of the users you want to allow to use the bot.
# Do not commit this file to source control.
111111111111
222222222222
333333333333
```

7. Run the bot

```bash
node index.js
```
