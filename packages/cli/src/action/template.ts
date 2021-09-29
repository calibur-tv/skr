import { getRemotePackageInfo } from '../utils'

export default async (
  name: string,
  urls: string[],
  opts: Record<string, any>
) => {
  console.log(name)
  console.log(urls)
  console.log(opts)
  const { filepath } = await getRemotePackageInfo('@calibur/mfe-loader')
  console.log(filepath)
}
