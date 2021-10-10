import fs from 'fs'
import { join } from 'path'
import { task } from 'hardhat/config'
import { Token, Token__factory } from '../../typechain'

task('deploy:Token').setAction(async (taskArgs, { ethers }) => {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  const Token: Token__factory = await ethers.getContractFactory('Token')
  const token: Token = <Token>await Token.deploy()

  await token.deployed()
  console.log('Token deployed to: ', token.address)
  await saveFrontendFiles(token)
})

const saveFrontendFiles = async (token: Token) => {
  const contractsDir = join(process.cwd(), '/frontend/contracts')

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true })
  }

  fs.writeFileSync(
    contractsDir + '/contract-address.json',
    JSON.stringify({ Token: token.address }, null, 2)
  )

  const artifacts = (await import('hardhat')).artifacts
  const TokenArtifact = artifacts.readArtifactSync('Token')

  fs.writeFileSync(
    contractsDir + '/Token.json',
    JSON.stringify(TokenArtifact, null, 2)
  )
}
