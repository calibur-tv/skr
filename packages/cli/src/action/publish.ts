import inquirer from 'inquirer'
import { getPackagesInfo, execCommand } from '../utils'

export default async () => {
  const { list } = await getPackagesInfo()
  const { name } = await inquirer.prompt({
    type: 'list',
    name: 'name',
    message: 'message',
    choices: list
  })

  await execCommand('lerna publish --dist-tag beta --canary --preid beta --yes')
}
