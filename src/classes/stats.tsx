/** How to show the value. Also applies to tagCoverage. */
export enum FactValueEmphasis {
  NONE = '', HIGHLIGHTED = 'high', NOT_APPLICABLE = 'na', UNKNOWN = 'unknown', TODO = 'todo',
  PARTIAL = 'partial', COMPLETE = 'complete', GOOD = 'good', BAD = 'bad', ERROR = 'error',
  PROGRESS_BAR = 'bar', PROGRESS_BAR_INACTIVE = 'bar_off'
}

export class FactValue {
  labelExecuteStatement: string
  value: string
  emphasis: FactValueEmphasis
  constructor(value: string | number, emphasis: FactValueEmphasis = FactValueEmphasis.NONE, labelExecuteStatement: string = '') {
    this.value = value as string
    this.emphasis = emphasis
    this.labelExecuteStatement = labelExecuteStatement
  }
}

export function FactValues(values: string | number | (string | number)[]): FactValue[] {
  if (Array.isArray(values)) {
    return (values as string[]).map(e => new FactValue(e))
  } else {
    return [new FactValue(values)]
  }
}

export class Fact {
  label: FactValue
  values: FactValue[]
  constructor(label: FactValue | string, values: FactValue[]) {
    if (label instanceof FactValue) {
      this.label = label
    } else {
      this.label = new FactValue(label)
    }
    this.values = values
  }
}

export class FactCategory {
  name: string[]
  facts: Fact[] | FactCategory[]
  constructor(name: (string | number)[] | string | number, facts: Fact[] | FactCategory[]) {
    if (Array.isArray(name)) {
      this.name = name as string[]
    } else {
      this.name = [name as string]
    }
    this.facts = facts
  }
}

export class AppStateStats {
  show: boolean = false
  type: string = ''
  categories: FactCategory[] = []
}