import fs from 'fs'
import path from 'path'
import ejs from 'ejs'

const write = (
  input: string,
  output: string,
  config: Record<string, any> = {}
): void => {
  const files = fs.readdirSync(input)
  for (const filename of files) {
    copy(
      path.join(input, filename),
      path.join(process.cwd(), output, filename.replace('_', '.')),
      config
    )
  }
}

const copy = (src: string, dest: string, config: Record<string, any>): void => {
  const stat = fs.statSync(src)
  if (!fs.existsSync(path.dirname(dest))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
  }
  if (stat.isDirectory()) {
    copyDir(src, dest, config)
  } else {
    const file = fs.readFileSync(src, 'utf-8')
    fs.writeFileSync(dest, ejs.render(file, config))
  }
}

const copyDir = (
  src: string,
  dest: string,
  config: Record<string, any>
): void => {
  fs.mkdirSync(dest, { recursive: true })
  for (const file of fs.readdirSync(src)) {
    copy(path.resolve(src, file), path.resolve(dest, file), config)
  }
}

export default write
