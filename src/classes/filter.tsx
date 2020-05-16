import { DataCategory } from "./dataCategory"

// when adding here, also add to AppStateFilter.special
/** Possible special values to filter minions by. */
export enum FilterParameterSpecial { NONE = 'none', NO_TAG = 'notag', HAS_COMMENT = 'hascomment' }
export enum FilterType { TAG, SPECIAL }
export enum FilterMethod { NO, YES, ANY }

export class FilterParameter {
  type: FilterType
  method: FilterMethod
  data: (DataCategory | string | FilterParameterSpecial)[]
  constructor(type: FilterType, method: FilterMethod, param: (DataCategory | string | FilterParameterSpecial)[] = []) {
    this.type = type
    this.method = method
    this.data = param
  }
  static get method() { return ['has', 'no', 'any'] }
  static get special() { return ['notag', 'hascomment'] }
}