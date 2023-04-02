// module that will be used to read and write usernames to a file called users.txt
import * as fs from 'fs'
import * as path from 'path'

const FileUsers = () => {
  function readUsers(): string[] {
    const usersPath = path.join(__dirname, '../users.txt')
    const users = fs.readFileSync(usersPath, 'utf-8')
    return users.split('\n').map((user) => user.trim())
  }

  function writeUsers(users: string[]): void {
    const usersPath = path.join(__dirname, '../users.txt')
    fs.writeFileSync(usersPath, users.join('\n'))
  }

  function addUser(user: string): void {
    const users = readUsers()
    users.push(user)
    writeUsers(users)
  }

  function removeUser(user: string): void {
    const users = readUsers()
    const index = users.indexOf(user)
    if (index > -1) {
      users.splice(index, 1)
      writeUsers(users)
    }
  }

  function checkUser(user: string): boolean {
    const users = readUsers()
    console.log('users ', users)
    return users.includes(user)
  }
  return {
    checkUser,
    addUser,
    removeUser,
  }
}

export default FileUsers
