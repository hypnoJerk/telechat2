import PromptsObj from '../prompt/promptsObj'
import DB from '../context/db'
interface PromptInterface {
  chatId: number
  limit?: number | undefined
  model?: string | undefined
  promptId: string
  prompt?: string
  temperature?: number | undefined
}

const Prompt = (props: PromptInterface) => {
  function setPrompt() {
    const db = DB()
    const promptObj = PromptsObj()

    let prompt = promptObj.default
    let model = 'gpt-3.5-turbo'

    //create list of gpt versions
    const gptVersions = [
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-0613',
      'gpt-3.5-turbo-1106',
      'gpt-3.5-turbo-0125',
      'gpt-4',
      'gpt-4-turbo-preview',
      'gpt-4-1106-preview',
      'gpt-4-0125-preview',
    ]
    if (props.model) {
      console.log('if props.model true ', props.model)
      switch (props.model) {
        case '3.5':
          // code for gpt-3.5-turbo
          model = gptVersions[0]
          break
        case '3.5.2':
          // code for gpt-3.5-turbo-0613
          model = gptVersions[1]
          break
        case '3.5.3':
          // code for gpt-3.5-turbo-1106
          model = gptVersions[2]
          break
        case '3.5.4':
          // code for gpt-3.5-turbo-0125
          model = gptVersions[3]
          console.log('set model', model)
          break
        case '4':
          // code for gpt-4
          model = gptVersions[4]
          break
        case '4.1':
          // code for gpt-4-turbo-preview
          model = gptVersions[5]
          break
        case '4.2':
          // code for gpt-4-1106-preview
          model = gptVersions[6]
          break
        case '4.3':
          model = gptVersions[7]
          break
        default:
          // code for other models
          model = gptVersions[0]
          break
      }
    }

    // if custom
    if (props.promptId === 'custom') {
      console.log('Model: ', model)
      console.log('temperature: ', props.temperature)
      console.log('limit: ', props.limit)
      prompt = {
        name: 'custom',
        screenName: 'custom',
        color: '\x1b[33m',
        model: model,
        hidden: true,
        temperature:
          typeof props.temperature === 'number' && !isNaN(props.temperature)
            ? props.temperature
            : 0.7,
        promptLimit:
          typeof props.limit === 'number' && !isNaN(props.limit)
            ? props.limit
            : 6,
        description: 'custom prompt',
        content: props.prompt ?? '',
      }
    } else {
      prompt = promptObj[props.promptId]
    }

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
