import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { Token } from '../typechain-types'

describe('Token contract', function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Token: Token
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const contractFactory = await ethers.getContractFactory('Token')
    ;[owner, addr1, addr2] = await ethers.getSigners()

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    Token = <Token>await contractFactory.deploy('NFT')
  })

  // You can nest describe calls to create subsections.
  describe('Deployment', function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it('Should set the right owner', async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await Token.owner()).to.equal(owner.address)
    })

    it('Should assign the total supply of tokens to the owner', async function () {
      const ownerBalance = await Token.balanceOf(owner.address)
      expect(await Token.totalSupply()).to.equal(ownerBalance)
    })
  })

  describe('Transactions', function () {
    it('Should transfer tokens between accounts', async function () {
      // Transfer 50 tokens from owner to addr1
      await Token.transfer(addr1.address, 50)
      const addr1Balance = await Token.balanceOf(addr1.address)
      expect(addr1Balance).to.equal(50)

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await Token.connect(addr1).transfer(addr2.address, 50)
      const addr2Balance = await Token.balanceOf(addr2.address)
      expect(addr2Balance).to.equal(50)
    })

    it('Should fail if sender doesn’t have enough tokens', async function () {
      const initialOwnerBalance = await Token.balanceOf(owner.address)

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        Token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith('Not enough tokens')

      // Owner balance shouldn't have changed.
      expect(await Token.balanceOf(owner.address)).to.equal(initialOwnerBalance)
    })

    it('Should update balances after transfers', async function () {
      const initialOwnerBalance: BigNumber = await Token.balanceOf(
        owner.address
      )

      // Transfer 100 tokens from owner to addr1.
      await Token.transfer(addr1.address, 100)

      // Transfer another 50 tokens from owner to addr2.
      await Token.transfer(addr2.address, 50)

      // Check balances.
      const finalOwnerBalance = await Token.balanceOf(owner.address)
      expect(finalOwnerBalance).to.equal((initialOwnerBalance as any) - 150)

      const addr1Balance = await Token.balanceOf(addr1.address)
      expect(addr1Balance).to.equal(100)

      const addr2Balance = await Token.balanceOf(addr2.address)
      expect(addr2Balance).to.equal(50)
    })
  })
})
