import configManager from '../manager/config'

export default async (
  name: string,
  urls: string[],
  opts: Record<string, any>
) => {
  const config = configManager.get()
  const templates = config.templates || []
  if (opts.remove) {
    const index = templates.findIndex(
      (_: Record<string, any>) => _.name === name
    )
    if (index !== -1) {
      templates.splice(index, 1)
    }
  } else {
    templates.push({
      name,
      desc: opts.desc || urls.join(' + '),
      urls
    })
  }
  configManager.set({ templates })
}
