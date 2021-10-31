<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="flex-col justify-center hero-content lg:flex-row">
      <div class="text-center lg:text-left">
        <h1 class="mb-5 text-5xl font-bold">Transfer</h1>

        <p v-if="state.transactionError" class="mb-5 mr-5">
          {{ state.transactionError.message }}
        </p>

        <p v-else-if="txHash" class="mb-5 mr-5">
          Waiting for transaction <strong>{{ txHash }}</strong> to be mined
        </p>

        <div v-else-if="balance.eq(0)" class="mb-5 mr-5">
          <div>You don't have tokens to transfer</div>
          <div>
            To get some tokens, open a terminal in the root of the repository
            and run:
            <code
              >npx hardhat --network localhost faucet
              {{ selectedAddress }}</code
            >
          </div>
        </div>

        <p v-else class="mb-5 mr-5">
          Welcome <b>{{ selectedAddress }}</b
          >, you have {{ balance.toString() }} {{ tokenData.symbol }}.
        </p>
      </div>

      <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <div class="card-body">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Amount of {{ tokenData.symbol }}</span>
            </label>
            <input
              v-model="form.amount"
              type="text"
              placeholder="amount"
              class="input input-bordered"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Recipient address</span>
            </label>
            <input
              v-model="form.to"
              type="text"
              placeholder="address"
              class="input input-bordered"
            />
          </div>
          <div class="form-control mt-6">
            <button type="button" class="btn btn-primary" @click="submit">
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { getEthers } from '../assets/provider'

const ERROR_CODE_TX_REJECTED_BY_USER = 4001
const props = defineProps<{
  txHash: string
  selectedAddress: string
  balance: any
  tokenData: {
    symbol: string
    name: string
  }
}>()

const emit = defineEmits<{
  (e: 'transfer', state: Record<string, any>): void
}>()

const form = reactive({
  amount: '',
  to: ''
})

const state = reactive({
  transactionError: undefined,
  txBeingSent: '',
  balance: props.balance
})

const submit = async () => {
  if (!form.to || !form.amount) {
    return
  }

  // Sending a transaction is a complex operation:
  //   - The user can reject it
  //   - It can fail before reaching the ethereum network (i.e. if the user
  //     doesn't have ETH for paying for the tx's gas)
  //   - It has to be mined, so it isn't immediately confirmed.
  //     Note that some testing networks, like Hardhat Network, do mine
  //     transactions immediately, but your dapp should be prepared for
  //     other networks.
  //   - It can fail once mined.
  //
  // This method handles all of those things, so keep reading to learn how to
  // do it.

  try {
    // If a transaction fails, we save that error in the component's state.
    // We only save one such error, so before sending a second transaction, we
    // clear it.
    state.transactionError = undefined

    // We send the transaction, and save its hash in the Dapp's state. This
    // way we can indicate that we are waiting for it to be mined.
    const { token } = getEthers()
    const tx = await token.transfer(form.to, form.amount)
    state.txBeingSent = tx.hash

    // We use .wait() to wait for the transaction to be mined. This method
    // returns the transaction's receipt.
    const receipt = await tx.wait()

    // The receipt, contains a status flag, which is 0 to indicate an error.
    if (receipt.status === 0) {
      // We can't know the exact error that made the transaction fail when it
      // was mined, so we throw this generic one.
      throw new Error('Transaction failed')
    }

    // If we got here, the transaction was successful, so you may want to
    // update your state. Here, we update the user's balance.
    state.balance = await token.balanceOf(props.selectedAddress)
    emit('transfer', state)
  } catch (error) {
    // We check the error code to see if this error was produced because the
    // user rejected a tx. If that's the case, we do nothing.
    if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
      return
    }

    // Other errors are logged and stored in the Dapp's state. This is used to
    // show them to the user, and for debugging.
    console.error(error)
    state.transactionError = error
  } finally {
    // If we leave the try/catch, we aren't sending a tx anymore, so we clear
    // this part of the state.
    state.txBeingSent = ''
  }
}
</script>
