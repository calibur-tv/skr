import { getRepositoryPackages, execCommand, promptWithDefault } from '../utils'

export default async (script: string): Promise<any> => {
  const { list } = await getRepositoryPackages()
  const name = await promptWithDefault({
    choices: list
  })

  await execCommand(`lerna exec --scope=${name} -- npm run ${script}`)
}
