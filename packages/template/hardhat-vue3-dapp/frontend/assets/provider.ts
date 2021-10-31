import { ethers } from 'ethers'
import TokenArtifact from '../contracts/Token.json'
import contractAddress from '../contracts/contract-address.json'

let token
let provider

const getEthers = (refresh = false) => {
  if (token && provider && !refresh) {
    return { token, provider }
  }

  // We first initialize ethers by creating a provider using window.ethereum
  provider = new ethers.providers.Web3Provider((window as any).ethereum)

  // When, we initialize the contract using that provider and the token's
  // artifact. You can do this same thing with your contracts.
  token = new ethers.Contract(
    contractAddress.Token,
    TokenArtifact.abi,
    provider.getSigner(0)
  )

  return { token, provider }
}

export { getEthers }
