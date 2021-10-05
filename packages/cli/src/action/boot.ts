import {
  getRepositoryPackages,
  getPackageDependencies,
  execCommand,
  promptWithDefault
} from '../utils'

export default async (packageName: string, options: Record<string, any>) => {
  const { list, detail } = await getRepositoryPackages()
  packageName = await promptWithDefault({
    choices: list,
    default: packageName
  })

  if (options.clean) {
    await execCommand('lerna clean --yes')
  }

  const dependencies = await getPackageDependencies(packageName)
  for (let i = 0; i < dependencies.length; i++) {
    const item = detail.find(
      (_: Record<string, string>) => _.name === dependencies[i]
    )
    await execCommand(`yarn --cwd ${item.location} build`)
  }
}
