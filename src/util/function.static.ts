import * as crypto from 'crypto'

export class FunctionStatic {

  static stringToMD5(Message: string): string {
    const hash = crypto.createHash('md5')
    hash.update(Message, 'utf8')
    return hash.digest('hex')
  }

  static replaceInvalidCharacter(input: string) {
    return input.replace(/[^\w\s\-_]/ug, '')
  }
}
