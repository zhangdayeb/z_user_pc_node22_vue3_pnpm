// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    noNeedToken?: boolean
    noNeedTip?: boolean
  }

  export interface AxiosResponse {
    code: number
    message?: string
    file_url?: string
    bank_type?: object
    operate_type?: Array
    statistic?: object
    money_type: object
    apis?: Array
    gamelists: Array
    apigames: Array
    notice?: number
    unread?: number
    alert: ApiNotice
  }
}
