import { execCommand } from '../utils'

export default async () => {
  console.log('skr init start！')
  try {
    await execCommand('npm list lerna', false)
  } catch (e) {
    await execCommand('npm install lerna -g')
  }
  try {
    await execCommand('yarn -v', false)
  } catch (e) {
    await execCommand('npm install yarn -g')
  }
  console.log('skr init success！')
}
