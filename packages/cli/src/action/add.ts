import inquirer from 'inquirer'
import { getRepositoryPackages, execCommand } from '../utils'

export default async (
  packageName: string,
  options: Record<string, any>
): Promise<any> => {
  const { list } = await getRepositoryPackages()
  const { name } = await inquirer.prompt({
    type: 'list',
    name: 'name',
    message: 'message',
    choices: list
  })

  let script = `lerna add ${packageName} --scope=${name}`
  if (options.D || options.dev) {
    script += ' --dev'
  } else if (options.D || options.peer) {
    script += ' --peer'
  }

  await execCommand(script)
}
