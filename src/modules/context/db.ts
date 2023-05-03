import sqlite3 from 'sqlite3'
import { MessageList, Chat, Message } from '../../types/chat'

interface DB_Interface {
  chatId: number
  messages: MessageList
  promptId: string
  prompt: string
  temperature: number
  promptLimit: number
  error?: string
}

interface DB_return_Interface {
  chatId: number
  messages: MessageList
  promptId: string
  prompt: string
  temperature: number
  promptLimit: number
  error?: string
}

const DB = () => {
  const db = new sqlite3.Database('db.sqlite3')
  db.serialize(() => {
    // console.log('create table if not exists')
    db.run(
      'CREATE TABLE IF NOT EXISTS chat (chatId INTEGER, messages TEXT, promptId TEXT, prompt TEXT, temperature REAL, promptLimit INTEGER)',
    )
  })

  function addMessage({
    chatId,
    messages,
    promptId,
    prompt,
    temperature,
    promptLimit,
  }: DB_Interface) {
    // console.log('context/db.ts - addMessage - promptLimit: ' + promptLimit)
    db.serialize(() => {
      // json stringify the messages array
      const strjson = JSON.stringify(messages)
      // console.log('addMessage - serialize chatId: ' + chatId, strjson, temperature)
      // db.run('CREATE TABLE IF NOT EXISTS chat (chatId INTEGER, messages TEXT, temperature REAL)');
      // remove all entries from the table that match the chatId
      db.run('DELETE FROM chat WHERE chatId = ?', [chatId])
      db.run(
        'INSERT INTO chat VALUES (?, ?, ?, ?, ?, ?)',
        [chatId, strjson, promptId, prompt, temperature, promptLimit],
        (err) => {
          if (err) {
            const error = err.message
            console.log(error)
          }
        },
      )
    })
    // db.close();
  }

  function getMessages(chatId: number) {
    return new Promise<DB_return_Interface>((resolve, reject) => {
      let data: DB_return_Interface
      // console.log('getMessages - serialize chatId: ' + chatId)
      db.serialize(() => {
        db.get(
          'SELECT * FROM chat WHERE chatId = ?',
          [chatId],
          async (err, rows) => {
            if (err) {
              console.log(err.message)
              reject(err)
              return
            }
            // console.log('getMessages rows', rows);
            data = rows as DB_return_Interface
            resolve(data)
          },
        )
      })
    })
  }

  function deleteMessages(chatId: number) {
    db.serialize(() => {
      db.run('DELETE FROM chat WHERE chatId = ?', [chatId])
    })
  }

  function getPrompt(chatId: number) {
    return new Promise<{ promptId: string; prompt: string }>(
      (resolve, reject) => {
        db.serialize(() => {
          db.get(
            'SELECT promptId, prompt FROM chat WHERE chatId = ?',
            [chatId],
            (err, row: any) => {
              if (err) {
                console.log(err.message)
                reject(err)
                return
              }
              resolve({ promptId: row.promptId, prompt: row.prompt })
            },
          )
        })
      },
    )
  }

  async function setPrompt(
    chatId: number,
    promptId: string,
    prompt: string,
    temperature: number,
    promptLimit: number,
  ) {
    const chat = await getMessages(chatId)
    if (!chat) {
      const newChat: Chat = {
        chatId,
        messages: {
          messages: [] as Message[],
        },
        promptId,
        prompt,
        temperature,
        promptLimit,
      }
      addMessage(newChat as DB_Interface)
    } else {
      db.serialize(() => {
        db.run(
          'UPDATE chat SET promptId = ?, prompt = ?, MESSAGES = "", TEMPERATURE = ?, promptLimit = ?  WHERE chatId = ?',
          [promptId, prompt, temperature, promptLimit, chatId],
          (err) => {
            if (err) {
              const error = err.message
              console.log(error)
            }
          },
        )
      })
    }
  }

  // db.close();
  return {
    addMessage,
    getMessages,
    deleteMessages,
    getPrompt,
    setPrompt,
  }
}

export default DB
