import fs from 'fs'
import path from 'path'

export default async () => {
  await fs.promises.unlink(path.resolve('./lerna.json'))
  const pkg = JSON.parse(
    await fs.promises.readFile(path.resolve('./package.json'), 'utf-8')
  )
  delete pkg.workspaces

  await fs.promises.writeFile(
    path.resolve('./package.json'),
    JSON.stringify(pkg, null, 2)
  )
}
