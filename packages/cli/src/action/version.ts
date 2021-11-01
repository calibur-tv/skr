import {
  getRepositoryPackages,
  getPackageDependencies,
  execCommand,
  promptWithDefault
} from '../utils'

const releaseType = [
  'major',
  'minor',
  'patch',
  'premajor',
  'preminor',
  'prepatch',
  'prerelease'
]

export default async (name: string, opts: Record<string, any>) => {
  const { list, detail } = await getRepositoryPackages(true)
  name = await promptWithDefault({
    choices: list,
    default: name
  })

  const release =
    opts.release ||
    (await promptWithDefault({
      choices: releaseType
    }))

  const dependencies = await getPackageDependencies(name, opts.self)
  const command = [
    release,
    /pre/.test(release) ? '--preid beta' : '',
    '--exact',
    '--no-private',
    `--force-publish=${dependencies.join(',')}`,
    '--yes'
  ]

  await execCommand(`lerna version ${command.filter((_) => _).join(' ')}`)

  for (let i = 0; i < dependencies.length; i++) {
    const item = detail.find(
      (_: Record<string, string>) => _.name === dependencies[i]
    )
    await execCommand(`npm publish ${item.location}`)
  }
}
