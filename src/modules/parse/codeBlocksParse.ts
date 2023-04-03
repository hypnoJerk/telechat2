const CodeBlocksParse = (text: string): string => {
  function escapeHtml(unsafeText: string) {
    return (
      unsafeText
        .replace(/&(?!amp;|lt;|gt;|#\d+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        //   .replace(/'/g, '&#039;')
        .replace(/!/g, '&#33;')
    )
  }

  function codeBlockBackTickReplace(codeBlock: string) {
    let output = ''
    let buffer = ''
    let backtickCount = 0
    let inSingleBacktick = false
    let inTripleBacktick = false

    for (const char of codeBlock) {
      if (char === '`') {
        backtickCount++
        buffer += char
      } else {
        if (backtickCount === 1 && !inTripleBacktick) {
          if (!inSingleBacktick) {
            output += `<code>${buffer.slice(1)}`
          } else {
            output += `${buffer.slice(0, -1)}&#96;</code>`
          }
          inSingleBacktick = !inSingleBacktick
        } else {
          output += buffer
        }
        backtickCount = 0
        buffer = char
      }
    }
    output += buffer

    return output
  }

  function convertCodeBlocks(preparedText: string): string {
    const escapedText = escapeHtml(preparedText)
    const textWithBackTicksReplaced = codeBlockBackTickReplace(escapedText)

    const codeBlockPreFormatRegex = /```(\w*)\n([\s\S]*?)\n```/g // matches all code blocks with language identifier
    return textWithBackTicksReplaced.replace(
      codeBlockPreFormatRegex,
      (match, lang, codeBlock) => {
        let languageClass = 'language'
        if (lang) {
          languageClass = 'language-' + lang.toLowerCase()
        }

        const escapedCodeBlock = escapeHtml(codeBlock)
        // wrap the matched code block with <pre><code class="[languageClass]"> and </code></pre>,
        // removing the triple backticks
        const preformatted = `<pre><code class="${languageClass}">${escapedCodeBlock}</code></pre>`
        return preformatted
      },
    )
  }

  return convertCodeBlocks(text)
}

export default CodeBlocksParse
