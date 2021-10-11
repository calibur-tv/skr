import {
  getRepositoryPackages,
  execCommand,
  promptWithDefault,
  inputWithValidator,
  isValidPackageName
} from '../utils'

export default async (
  script: string,
  opts: Record<string, any>
): Promise<any> => {
  script = await inputWithValidator({
    message: '请输入项目名',
    initial: script,
    validator: (val) => isValidPackageName(val),
    failed: () => console.log('非法的脚本名')
  })
  const { list } = await getRepositoryPackages()
  const name = await promptWithDefault({
    choices: list,
    default: opts.name
  })

  await execCommand(`lerna exec --scope=${name} -- npm run ${script}`)
}
