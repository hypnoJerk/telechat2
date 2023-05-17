import PromptsObj from '../prompt/promptsObj'
import DB from '../context/db'
interface PromptInterface {
  chatId: number
  promptId: string
  prompt?: string
}

const Prompt = (props: PromptInterface) => {
  function setPrompt() {
    const db = DB()
    const promptObj = PromptsObj()
    const prompt = promptObj[props.promptId]

    if (prompt) {
      props.prompt = prompt.content
      db.setPrompt(
        props.chatId,
        props.promptId,
        props.prompt,
        prompt.temperature,
        prompt.promptLimit,
        prompt.model,
      )
      console.log(
        'prompt/prompt.ts - setPrompt - prompt.promptLimit',
        prompt.promptLimit,
      )
    } else {
      props.prompt =
        'Please enter a valid prompt argument.\n\n Example:\n /prompt snoopdogg \n\nTo see a list of available prompts use the /list command.'
      return props
    }
    return props
  }

  function getPrompt() {
    const { chatId } = props
    const db = DB()
    return db.getPrompt(chatId)
  }

  return {
    setPrompt,
    getPrompt,
  }
}

export default Prompt
