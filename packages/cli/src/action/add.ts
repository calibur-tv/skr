import { getRepositoryPackages, execCommand, promptWithDefault } from '../utils'

export default async (
  names: string[],
  opts: Record<string, any>
): Promise<any> => {
  const { list } = await getRepositoryPackages()
  const name = await promptWithDefault({
    choices: list,
    default: opts.scope
  })

  for (let i = 0; i < names.length; i++) {
    let script = `lerna add ${names[i]} --scope=${name}`
    if (opts.dev) {
      script += ' --dev'
    } else if (opts.peer) {
      script += ' --peer'
    }

    if (opts.exact) {
      script += ' --exact'
    }

    await execCommand(script)
  }
}
