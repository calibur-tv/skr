import { getRepositoryPackages, execCommand, promptWithDefault } from '../utils'

export default async (
  script: string,
  opts: Record<string, any>
): Promise<any> => {
  const { list } = await getRepositoryPackages()
  const name = await promptWithDefault({
    choices: list,
    default: opts.name
  })

  await execCommand(`lerna exec --scope=${name} -- npm run ${script}`)
}
