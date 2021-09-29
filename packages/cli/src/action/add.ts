import { getRepositoryPackages, execCommand, promptWithDefault } from '../utils'

export default async (
  names: string[],
  options: Record<string, any>
): Promise<any> => {
  const { list } = await getRepositoryPackages()
  const name = await promptWithDefault({
    choices: list
  })

  for (let i = 0; i < names.length; i++) {
    let script = `lerna add ${names[i]} --scope=${name}`
    if (options.dev) {
      script += ' --dev'
    } else if (options.peer) {
      script += ' --peer'
    }

    if (options.exact) {
      script += ' --exact'
    }

    await execCommand(script)
  }
}
