import { Request } from 'express'

export type EmailDataType = {
  email: string
  subject: string
  html: string
}
export interface CustomRequest extends Request {
  userId?: string
}