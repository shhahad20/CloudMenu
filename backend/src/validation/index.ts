import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

export const runValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let errorsList = errors.array().map((error) => error.msg)
    return res.status(422).send({
      message: errorsList[0],
    })
  }
  next()
}
export const runValidationUser = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    let errorsList = errors.array().map((error) => error.msg)
    return res.status(422).send({
      message: errorsList[0],
    })
  }
  next()
}