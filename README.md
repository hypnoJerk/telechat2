# telechat2

# Telegram Bot

This is a telegram bot that uses the GPT-3.5 & GPT-4 API to generate text. It is a work in progress.

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

4. Create a file called users.txt and add the telegram user ids of the users you want to allow to use the bot (will use database in the future)

```txt
# Path: users.txt
# users.txt file
# This file should be used to store the telegram user ids of the users you want to allow to use the bot.
# Do not commit this file to source control.
111111111111
222222222222
333333333333
```

5. Install the dependencies

```bash
yarn install
```

6. Build the project with typescript TSC. The output should be in the dist directory

```bash
tsc
```

7. Run the bot

```bash
node index.js
```
