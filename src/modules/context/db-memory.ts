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
      'CREATE TABLE IF NOT EXISTS profile (chatId INTEGER PRIMARY KEY, name TEXT, nickname TEXT, s TEXT, pronouns TEXT, age INTEGER, location TEXT)',
    )
    db.run(
      'CREATE TABLE IF NOT EXISTS memory (id INTEGER PRIMARY KEY AUTOINCREMENT, chatId INTEGER, promptId TEXT, memory TEXT, datetime TEXT )',
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
  }: Memory_profile_Interface): Promise<void> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Check if the chatId exists
        db.get(
          'SELECT chatId FROM profile WHERE chatId = ?',
          [chatId],
          (err, row) => {
            if (err) {
              console.error('Failed to retrieve chatId:', err.message)
              reject(err)
              return
            }

            if (row) {
              // chatId exists, update only the provided fields
              const updateFields = []
              const updateValues = []

              if (name !== undefined) {
                updateFields.push('name = ?')
                updateValues.push(name)
              }
              if (nickname !== undefined) {
                updateFields.push('nickname = ?')
                updateValues.push(nickname)
              }
              if (s !== undefined) {
                updateFields.push('s = ?')
                updateValues.push(s)
              }
              if (pronouns !== undefined) {
                updateFields.push('pronouns = ?')
                updateValues.push(pronouns)
              }
              if (age !== undefined) {
                updateFields.push('age = ?')
                updateValues.push(age)
              }
              if (location !== undefined) {
                updateFields.push('location = ?')
                updateValues.push(location)
              }

              // Add chatId to the end of the values array
              updateValues.push(chatId)

              const updateQuery = `
            UPDATE profile
            SET ${updateFields.join(', ')}
            WHERE chatId = ?`

              db.run(updateQuery, updateValues, (err) => {
                if (err) {
                  console.error('Failed to update row:', err.message)
                  reject(err)
                } else {
                  console.log(`Row updated successfully for chatId: ${chatId}`)
                  resolve()
                }
              })
            } else {
              // chatId does not exist, insert a new row
              const insertQuery = `
            INSERT INTO profile (chatId, name, nickname, s, pronouns, age, location)
            VALUES (?, ?, ?, ?, ?, ?, ?)`

              db.run(
                insertQuery,
                [
                  chatId,
                  name || '',
                  nickname || '',
                  s || '',
                  pronouns || '',
                  age || 0,
                  location || '',
                ],
                (err) => {
                  if (err) {
                    console.error('Failed to insert row:', err.message)
                    reject(err)
                  } else {
                    console.log(
                      `Row inserted successfully for chatId: ${chatId}`,
                    )
                    resolve()
                  }
                },
              )
            }
          },
        )
      })
    })
  }

  function getProfile(
    chatId: number,
  ): Promise<Memory_profile_return_Interface | null> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(
          'SELECT * FROM profile WHERE chatId = ?',
          [chatId],
          (err, row: Memory_profile_return_Interface) => {
            if (err) {
              console.log(err.message)
              reject(err)
            } else {
              resolve(row)
            }
          },
        )
      })
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
  }: Memory_Interface): Promise<{ memory: string }> {
    return new Promise<{ memory: string }>((resolve, reject) => {
      db.serialize(() => {
        db.run(
          'INSERT INTO memory (chatId, promptId, memory, datetime) VALUES (?, ?, ?, ?)',
          [chatId, promptId, memory, datetime],
          (err) => {
            if (err) {
              reject(err.message)
            } else {
              resolve({ memory })
            }
          },
        )
      })
    })
  }

  function getMemory(
    chatId: number,
    promptId: string,
  ): Promise<Memory_return_Interface[]> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(
          'SELECT id, * FROM memory WHERE chatId = ? AND promptId = ?',
          [chatId, promptId],
          (err, rows: Memory_return_Interface[]) => {
            if (err) {
              console.error(err.message)
              reject(err)
              return
            }
            resolve(rows)
          },
        )
      })
    })
  }

  function deleteMemories(chatId: number, promptId: string) {
    db.serialize(() => {
      db.run(
        'DELETE FROM memory WHERE chatId = ? AND promptId = ?',
        [chatId, promptId],
        (err) => {
          if (err) {
            const error = err.message
            console.log(error)
          }
        },
      )
    })
  }

  function deleteSelectedMemories(ids: number[]) {
    if (ids.length === 0) {
      return
    }

    const placeholders = ids.map(() => '?').join(',')
    const query = `DELETE FROM memory WHERE id IN (${placeholders})`

    db.serialize(() => {
      db.run(query, ids, (err) => {
        if (err) {
          const error = err.message
          console.log(error)
        }
      })
    })
  }

  return {
    addNewProfile,
    addToProfile,
    getProfile,
    deleteProfile,
    addNewMemory,
    getMemory,
    deleteMemories,
    deleteSelectedMemories,
  }
} // end of const Memory

export default Memory
