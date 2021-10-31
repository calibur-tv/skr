<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="text-center hero-content">
      <div class="max-w-md">
        <h1 class="mb-5 text-5xl font-bold">Connect Wallet</h1>
        <p class="mb-5">
          {{ state.networkError || 'Please connect to your wallet.' }}
        </p>
        <button class="btn btn-primary" @click="connect">Get Started</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onBeforeUnmount, toRaw } from 'vue'
import { getEthers } from '../assets/provider'

const state = reactive({
  balance: 0,
  tokenData: null,
  networkError: '',
  selectedAddress: ''
})

const _pollDataInterval = ref(0)

const emit = defineEmits<{
  (e: 'change', state: Record<string, any>): void
}>()

const HARDHAT_NETWORK_ID = '31337'
const ETH = (window as any).ethereum

const connect = async () => {
  // This method is run when the user clicks the Connect. It connects the
  // dapp to the user's wallet, and initializes it.

  // To connect to the user's wallet, we have to run this method.
  // It returns a promise that will resolve to the user's address.
  const [selectedAddress] = await ETH.request({
    method: 'eth_requestAccounts'
  })
  // Once we have the address, we can initialize the application.

  // First we check the network
  if (!_checkNetwork()) {
    return
  }

  _initialize(selectedAddress)

  // We reinitialize it whenever the user changes their account.
  ETH.on('accountsChanged', ([newAddress]) => {
    _stopPollingData()
    // `accountsChanged` event can be triggered with an undefined newAddress.
    // This happens when the user removes the Dapp from the "Connected
    // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
    // To avoid errors, we reset the dapp state
    if (newAddress === undefined) {
      return _resetState()
    }

    _initialize(newAddress)
  })

  // We reset the dapp state if the network is changed
  ETH.on('chainChanged', () => {
    _stopPollingData()
    _resetState()
  })
}

const _resetState = () => {
  state.networkError = ''
  state.selectedAddress = ''
  state.tokenData = null
  state.balance = 0
  emit('change', toRaw(state))
}

// This method checks if Metamask selected network is Localhost:8545
const _checkNetwork = () => {
  if (ETH.networkVersion === HARDHAT_NETWORK_ID) {
    return true
  }

  state.networkError = 'Please connect Metamask to Localhost:8545'

  return false
}

const _initialize = async (userAddress) => {
  // This method initializes the dapp

  // We first store the user's address in the component's state
  state.selectedAddress = userAddress

  // Then, we initialize ethers, fetch the token's data, and start polling
  // for the user's balance.

  // Fetching the token data and the user's balance are specific to this
  // sample project, but you can reuse the same initialization pattern.
  const { token } = getEthers(true)
  await _getTokenData(token)
  await _updateBalance(token)
  _startPollingData(token)
  emit('change', toRaw(state))
}

const _getTokenData = async (token) => {
  const name = await token.name()
  const symbol = await token.symbol()
  state.tokenData = { name, symbol }
}

const _startPollingData = (token) => {
  _pollDataInterval.value = window.setInterval(
    () => _updateBalance(token),
    1000
  )
}

const _updateBalance = async (token) => {
  state.balance = await token.balanceOf(state.selectedAddress)
}

const _stopPollingData = () => {
  if (!_pollDataInterval.value) {
    return
  }
  window.clearInterval(_pollDataInterval.value)
  _pollDataInterval.value = 0
}

onBeforeUnmount(() => {
  _stopPollingData()
})
</script>
