import OpenAI from "openai"
import { levelSimplifyTypes } from "../types/aiTypes"


class AIService {
  completion: OpenAI
  ADAPT_LIGHT_PROMPT: string
  ADAPT_MEDIUM_PROMPT: string
  ADAPT_MAX_PROMPT: string
  constructor() {
    this.completion = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: "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",
      dangerouslyAllowBrowser: true
    })
    this.ADAPT_LIGHT_PROMPT = "Упрости следующий текст. Сделай лёгкое упрощение — сохрани стиль, структуру и смысл, но сделай формулировки более понятными, убери сложные конструкции. Важно: не искажай смысл, не добавляй новую информацию, сохрани структуру (если есть абзацы — оставь абзацы). Верни только текст без комментариев. Текст: "
    this.ADAPT_MEDIUM_PROMPT = "Упрости следующий текст. Сделай среднее упрощение — перефразируй текст проще, используй короткие предложения, замени сложные слова на повседневные. Важно: не искажай смысл, не добавляй новую информацию, сохрани структуру (если есть абзацы — оставь абзацы). Верни только текст без пояснений. Текст: "
    this.ADAPT_MAX_PROMPT = "Упрости следующий текст. Сделай максимальное упрощение — объясни текст максимально просто, как для ребёнка 8–10 лет, сохрани основной смысл без лишних деталей. Важно: не искажай смысл, не добавляй новую информацию, сохрани структуру (если есть абзацы — оставь абзацы). Верни только текст без комментариев. Текст: "
   }


  async SimplificationText(selectedText: string, target: levelSimplifyTypes = "ADAPT_LIGHT_PROMPT") {
    const res = await this.completion.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'user', content: (this[target] + selectedText) }
      ]
    })

    return res.choices[0].message.content
  }
}


export default new AIService()