import inquirer from 'inquirer'
import toposort from 'toposort'
import { getPackagesInfo, getDependencies, execCommand } from '../utils'

export default async () => {
  const { list, detail } = await getPackagesInfo()
  const { name } = await inquirer.prompt({
    type: 'list',
    name: 'name',
    message: 'message',
    choices: list
  })
  const tsort: [string, string][] = []
  await getTopoDependencies(name, detail, tsort)
  const dependencies = toposort(tsort).reverse()
  dependencies.forEach((item: string) => {
    execCommand(`lerna run build:${item}`)
  })
}

const getTopoDependencies = async (
  item: string,
  list: Record<string, any>[],
  tsort: [string, string][]
) => {
  const dependencies = await getDependencies(item, list)
  if (!dependencies.length) {
    return
  }

  dependencies.forEach((str: string) => {
    tsort.push([item, str])
  })

  for (let i = 0; i < dependencies.length; i++) {
    await getTopoDependencies(dependencies[i], list, tsort)
  }
}
