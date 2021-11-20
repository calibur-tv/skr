import configManager from '../manager/config'

export default async (
  name: string,
  urls: string[],
  opts: Record<string, any>
) => {
  const config = configManager.get()
  const templates = config.templates || {}

  if (opts.list) {
    console.log('\ntemplate list：\n')
    Object.keys(templates).forEach((name: string) => {
      console.log(`- ${name}`)
    })
    return
  }

  if (!name) {
    console.log('template name is required')
    return
  }

  if (opts.remove) {
    delete templates[name]
    configManager.set({ templates })
    return
  }

  if (!urls || !urls.length) {
    return
  }

  templates[name] = {
    desc: opts.desc || urls.join(' + '),
    urls
  }
  configManager.set({ templates })
}
