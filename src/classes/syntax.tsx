import { AppState } from "./state"
import { FilterParameter } from "./filter"

export enum SyntaxElementEnum {
  NONE = 'none', DATA_TYPE = 'data_type', FILTER_TYPE = 'filter_type', OF_TYPE = 'of_type', ANYTHING = 'any_valid_text', 
  NUMBER = 'number', TAG = 'tag', CATEGORY = 'category', COMMAND = 'command',
  ERROR = 'error', FILTER_CONDITION = 'filter_condition', FILTER_CONDITION_SPECIAL = 'special',
  COVERAGE_STATUS = 'tag_coverage_status'
}

export class SyntaxElement {
  accepts: SyntaxElementEnum[]
  unlimited: boolean
  constructor(accepts: SyntaxElementEnum | SyntaxElementEnum[], unlimited: boolean = false) {
    if (Array.isArray(accepts)) {
      this.accepts = accepts
    } else {
      this.accepts = [accepts]
    }
    this.unlimited = unlimited
  }
  correct(state: AppState, arg: string, ofType: SyntaxElementEnum): SyntaxElementEnum {
    for (let trueType of this.accepts) {
      const type = trueType === SyntaxElementEnum.OF_TYPE ? ofType : trueType
      switch (type) {
        case SyntaxElementEnum.ANYTHING:
          // would only fail due to illegal symbols
          return type

        case SyntaxElementEnum.COVERAGE_STATUS:
          if (['na', 'no', 'un', 'unknown', 'td', 'todo', 'pt', 'pa', 'partial', 'done', 'ok', 'complete'].includes(arg)) { return type }
          break

        case SyntaxElementEnum.CATEGORY:
        case SyntaxElementEnum.TAG:
        case SyntaxElementEnum.COMMAND:
          if (state.data[type].stringDict.hasOwnProperty(arg)) { return type }
          break

        case SyntaxElementEnum.FILTER_CONDITION:
          if (FilterParameter.method.includes(arg)) { return type }
          break

        case SyntaxElementEnum.FILTER_CONDITION_SPECIAL:
          if (FilterParameter.special.includes(arg)) { return type }
          break

        case SyntaxElementEnum.NUMBER:
          if (!isNaN(parseFloat(arg))) { return type }
          break

        case SyntaxElementEnum.DATA_TYPE:
          if (state.data.hasOwnProperty(arg) || ['card_relation'].includes(arg)) { return type }
          break

        case SyntaxElementEnum.FILTER_TYPE:
          if (state.data.hasOwnProperty(arg) || ['card_relation', 'special', 'scene'].includes(arg)) { return type }
          break

        default:
          alert('type check unhandled: ' + type)
          break
      }
    }
    return SyntaxElementEnum.ERROR
  }
  toString(): string {
    return this.accepts.map(e => String(e)).join('|')
  }
  toDisplay(): SyntaxElementEnum {
    return this.accepts.length > 1 ? SyntaxElementEnum.ANYTHING : this.accepts[0]
  }
}

export class Syntax {
  elements: SyntaxElement[]
  unlimited: SyntaxElement | null
  constructor(elements: (SyntaxElementEnum | SyntaxElementEnum[])[], unlimited: SyntaxElementEnum | null = null) {
    let els = elements.map(e => new SyntaxElement(e))
    this.unlimited = unlimited === null ? null : new SyntaxElement(unlimited)
    this.elements = els
  }
  toDisplay(): [string, SyntaxElementEnum[]] {
    let parts: string[] = []
    this.elements.forEach(e => parts.push(`<${e.toString()}>`))
    if (this.unlimited !== null) { parts.push(`[${this.unlimited.toString()}] […]`) }
    const elements = this.unlimited === null ? this.elements : this.elements.concat([this.unlimited!, this.unlimited!])
    return [parts.join(' '), elements.map(e => e.toDisplay())]
  }
}

