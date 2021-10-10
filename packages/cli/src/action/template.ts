import configManager from '../manager/config'

export default async (
  name: string,
  urls: string[],
  opts: Record<string, any>
) => {
  const config = configManager.get()
  const templates = config.templates || []

  if (opts.list) {
    console.log('\ntemplate list：\n')
    templates.forEach((item: any) => {
      console.log(`- ${item.name}`)
    })
    return
  }

  if (!name) {
    console.log('template name is required')
    return
  }

  if (opts.remove) {
    const index = templates.findIndex(
      (_: Record<string, any>) => _.name === name
    )
    if (index === -1) {
      return
    }

    templates.splice(index, 1)
    configManager.set({ templates })
    return
  }

  if (!urls || !urls.length) {
    return
  }

  templates.push({
    name,
    desc: opts.desc || urls.join(' + '),
    urls
  })
  configManager.set({ templates })
}
