import { TerminalLine } from "../terminal/TerminalPanel"
import { SyntaxElementEnum } from "./syntax"

export class AppStateTerminal {
   messageQueue: TerminalMessage[] = []
   input: TerminalLine = new TerminalLine('', [], true)
   output: TerminalLine[] = []
   history: string[] = []
   caret: number = -1
   uncommitted: string = ''
   tagInput:boolean=false
}

export class TerminalMessage {
   text: string
   error: boolean
   categories: SyntaxElementEnum[]

   constructor(text: string, categories: (SyntaxElementEnum | number)[] = [], error: boolean = false) {
      this.text = text
      let cats: SyntaxElementEnum[] = []
      const normal = error ? SyntaxElementEnum.ERROR : SyntaxElementEnum.NONE
      categories.forEach(e => typeof (e) === 'number' ? cats = cats.concat(Array(e).fill(normal)) : cats.push(e))
      this.categories = cats
      this.error = error
   }
}