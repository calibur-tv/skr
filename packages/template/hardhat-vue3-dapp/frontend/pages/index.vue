<template>
  <div id="wallet">
    <no-wallet-detected v-if="notPlugin"></no-wallet-detected>
    <connect-wallet v-else-if="notConnect" @change="syncState"></connect-wallet>
    <div v-else-if="showLoading">loading...</div>
    <template v-else>
      <transfer-form
        :tx-hash="state.txBeingSent"
        :token-data="state.tokenData"
        :balance="state.balance"
        :selected-address="state.selectedAddress"
        @transfer="syncState"
      ></transfer-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import NoWalletDetected from '../components/NoWalletDetected.vue'
import ConnectWallet from '../components/ConnectWallet.vue'
import TransferForm from '../components/TransferForm.vue'

const state = reactive({
  // The info of the token (i.e. It's Name and symbol)
  tokenData: undefined,
  selectedAddress: '',
  balance: undefined,
  txBeingSent: '',
  transactionError: undefined,
  networkError: undefined
})

const notPlugin = computed(() => (window as any).ethereum === undefined)
const notConnect = computed(() => !state.selectedAddress)
const showLoading = computed(() => !state.tokenData || !state.balance)

const syncState = (value) => {
  Object.keys(value).forEach((k) => {
    state[k] = value[k]
  })
}
</script>
