interface Prompt {
  name: string
  screenName: string
  color: string
  hidden: boolean
  temperature: number
  description: string
  content: string
}

interface Prompts {
  [key: string]: Prompt
}

// type Prompts = Record<string, Prompt>

export default Prompts
