import sqlite3 from 'sqlite3'

interface Memory_Interface {
  chatId: number
  promptId: string
  memory: string
  datetime: string
  error?: string
}

interface Memory_return_Interface {
  chatId: number
  promptId: string
  memory: string
  datetime: string
  error?: string
}

interface Memory_profile_Interface {
  chatId: number
  name?: string
  nickname?: string
  s?: string
  pronouns?: string
  age?: number
  location?: string
  error?: string
}

interface Memory_profile_return_Interface {
  chatId: number
  name: string
  nickname: string
  s: string
  pronouns: string
  age: number
  location: string
  error?: string
}

const Memory = () => {
  const db = new sqlite3.Database('db.sqlite3')
  db.serialize(() => {
    // console.log('create table if not exists')
    db.run(
      'CREATE TABLE IF NOT EXISTS profile (chatId INTEGER, name TEXT, nickname TEXT, s TEXT, pronouns TEXT, age INTEGER, location TEXT)',
    )
    db.run(
      'CREATE TABLE IF NOT EXISTS memory (chatId INTEGER, promptId TEXT, memory TEXT, datetime TEXT )',
    )
  })

  function addNewProfile({
    chatId,
    name,
    nickname,
    s,
    pronouns,
    age,
    location,
  }: Memory_profile_Interface) {
    db.serialize(() => {
      db.run(
        'INSERT INTO profile VALUES (?, ?, ?, ?, ?, ?, ?)',
        [chatId, name, nickname, s, pronouns, age, location],
        (err) => {
          if (err) {
            const error = err.message
            console.log(error)
          }
        },
      )
    })
  }

  function addToProfile({
    chatId,
    name,
    nickname,
    s,
    pronouns,
    age,
    location,
  }: Memory_profile_Interface) {
    db.serialize(() => {
      db.run(
        'UPDATE profile SET name = ?, nickname = ?, s = ?, pronouns = ?, age = ?, location = ? WHERE chatId = ?',
        [
          name || '',
          nickname || '',
          s || '',
          pronouns || '',
          age || 0,
          location || '',
          chatId,
        ],
        (err) => {
          if (err) {
            const error = err.message
            console.log(error)
          }
        },
      )
    })
  }

  function getProfile(chatId: number) {
    db.serialize(() => {
      db.get(
        'SELECT * FROM profile WHERE chatId = ?',
        [chatId],
        (err, row: Memory_profile_return_Interface) => {
          if (err) {
            console.log(err.message)
            return
          }
          return row
        },
      )
    })
  }

  function deleteProfile(chatId: number) {
    db.serialize(() => {
      db.run('DELETE FROM profile WHERE chatId = ?', [chatId], (err) => {
        if (err) {
          const error = err.message
          console.log(error)
        }
      })
    })
  }

  //   Memory note functions

  function addNewMemory({
    chatId,
    promptId,
    memory,
    datetime,
  }: Memory_Interface) {
    db.serialize(() => {
      db.run(
        'INSERT INTO memory VALUES (?, ?, ?, ?)',
        [chatId, promptId, memory, datetime],
        (err) => {
          if (err) {
            const error = err.message
            console.log(error)
          }
        },
      )
    })
  }

  function getMemory(chatId: number) {
    db.serialize(() => {
      db.get(
        'SELECT * FROM memory WHERE chatId = ?',
        [chatId],
        (err, row: Memory_return_Interface) => {
          if (err) {
            console.log(err.message)
            return
          }
          return row
        },
      )
    })
  }

  return {
    addNewProfile,
    addToProfile,
    getProfile,
    deleteProfile,
    addNewMemory,
    getMemory,
  }
} // end of const Memory

export default Memory
