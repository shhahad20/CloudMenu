import jwt from 'jsonwebtoken'

const generateToken = (tokenPayload: object, secretKey: string, expiresIn: string) => {
  try {
    if (typeof secretKey !== 'string' || secretKey === '') {
      throw new Error('secretKey invaild,secretKey must not be a non-empty string!')
    }
    const token = jwt.sign(tokenPayload, secretKey, {
      expiresIn: expiresIn,
    })
    return token
  } catch (error) {
    throw error
  }
}

export default generateToken