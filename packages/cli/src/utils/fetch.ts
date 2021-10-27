import URL from 'url'
import https from 'https'
import Agent from 'https-proxy-agent'

export default function fetch(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let options: string | Record<string, any> = url

    if (process.env.https_proxy) {
      const parsedUrl = URL.parse(url)
      options = {
        hostname: parsedUrl.host,
        path: parsedUrl.path,
        agent: new Agent(process.env.https_proxy)
      }
    }

    https
      .get(options, (response) => {
        if (!response || response.statusCode === undefined) {
          reject()
        }
        const code: number = response.statusCode
        if (code >= 400) {
          reject({ code, message: response.statusMessage })
        } else if (code >= 300) {
          fetch(response.headers.location as string).then(resolve, reject)
        } else {
          response.setEncoding('utf8')
          const body = []
          response.on('data', (chunk) => body.push(chunk))
          response.on('end', () => resolve(body.join('')))
        }
      })
      .on('error', reject)
  })
}
