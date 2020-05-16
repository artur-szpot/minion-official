export enum AppStateFileTypeEnum { NONE, DATA, IO_COPY, IO_MOVE }

export class AppStateFile {
  data: Object | string
  type: AppStateFileTypeEnum
  constructor(type: AppStateFileTypeEnum = AppStateFileTypeEnum.NONE, data: Object | string = '') {
    this.type = type
    this.data = data
  }
}