import path from 'path'
import os from 'os'
import fs from 'fs'
import { name } from '../../package.json'

const ROOT_NAME = '.' + name.split('/').pop()
const FILE_NAME = 'conf.json'

const rootPath = path.resolve(os.homedir(), ROOT_NAME)
const filepath = path.resolve(rootPath, FILE_NAME)

const set = (newConfig: Record<string, any>) => {
  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath, { recursive: true })
  }

  fs.writeFileSync(
    path.resolve(os.homedir(), ROOT_NAME, FILE_NAME),
    JSON.stringify(newConfig, null, 2)
  )
}

const get = (): Record<string, any> => {
  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath, { recursive: true })
  }

  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
  }

  const init = {}

  fs.writeFileSync(filepath, JSON.stringify(init))

  return init
}

const del = (key: string | string[]): void => {
  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath, { recursive: true })
  }

  const keys = Array.isArray(key) ? key : [key]
  const config = get()

  keys.forEach((k) => {
    delete config[k]
  })

  fs.writeFileSync(
    path.resolve(os.homedir(), ROOT_NAME, FILE_NAME),
    JSON.stringify(config)
  )
}

export default {
  set,
  get,
  del
}
