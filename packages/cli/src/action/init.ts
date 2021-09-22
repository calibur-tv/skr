import { exec } from '../utils'

export default async () => {
  console.log('skr init start！')
  try {
    await exec('npm list lerna', false)
  } catch (e) {
    await exec('npm install lerna -g')
  }
  try {
    await exec('yarn -v', false)
  } catch (e) {
    await exec('npm install yarn -g')
  }
  console.log('skr init success！')
}
