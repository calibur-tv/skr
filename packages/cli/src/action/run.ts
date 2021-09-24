import inquirer from 'inquirer'
import { getRepositoryPackages, execCommand } from '../utils'

export default async (script: string): Promise<any> => {
  const { list } = await getRepositoryPackages()
  const { name } = await inquirer.prompt({
    type: 'list',
    name: 'name',
    message: 'message',
    choices: list
  })

  await execCommand(`lerna exec --scope=${name} -- npm run ${script}`)
}
