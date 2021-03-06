import fs from 'fs'
import { join } from 'path'
import { task } from 'hardhat/config'
import { Artifacts } from 'hardhat/types'
import { Token } from '../../typechain-types'

task('deploy:Token')
  .addOptionalParam('name', 'the token name', 'echo')
  .setAction(
    async (TaskArguments, { artifacts, config, ethers, network, run }) => {
      // This is just a convenience check
      if (network.name === 'hardhat') {
        console.warn(
          'You are trying to deploy a contract to the Hardhat Network, which' +
            'gets automatically created and destroyed every time. Use the Hardhat' +
            " option '--network localhost'"
        )
      }
      const [deployer] = await ethers.getSigners()

      console.log(
        'Deploying contracts with the account:',
        await deployer.getAddress()
      )
      console.log('Account balance:', (await deployer.getBalance()).toString())
      const Token = await ethers.getContractFactory('Token')
      const token: Token = <Token>await Token.deploy(TaskArguments.name)

      await token.deployed()
      console.log('Token deployed to: ', token.address)
      await saveFrontendFiles(token, artifacts)

      if (network.name !== 'hardhat' && config.etherscan.apiKey) {
        await run('verify:verify', {
          address: token.address,
          constructorArguments: [TaskArguments.greeting]
        })
      }
    }
  )

const saveFrontendFiles = async (token: Token, artifacts: Artifacts) => {
  const contractsDir = join(process.cwd(), '/frontend/contracts')

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true })
  }

  fs.writeFileSync(
    contractsDir + '/contract-address.json',
    JSON.stringify({ Token: token.address }, null, 2)
  )

  const TokenArtifact = artifacts.readArtifactSync('Token')

  fs.writeFileSync(
    contractsDir + '/Token.json',
    JSON.stringify(TokenArtifact, null, 2)
  )
}
