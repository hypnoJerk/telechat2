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
    } else {
      props.prompt = 'You are a helpful assistant.'
    }

    db.setPrompt(props.chatId, props.promptId, props.prompt, prompt.temperature)
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
