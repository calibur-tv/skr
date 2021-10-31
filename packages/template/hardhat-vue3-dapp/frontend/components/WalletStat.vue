<template>
  <div id="wallet-stat">
    <h1>{{ tokenData.name }} ({{ tokenData.symbol }})</h1>
    <div v-if="balance.eq(0)">
      <p>You don't have tokens to transfer</p>
      <p>
        To get some tokens, open a terminal in the root of the repository and
        run:
        <br />
        <br />
        <code
          >npx hardhat --network localhost faucet {{ selectedAddress }}</code
        >
      </p>
    </div>
    <p v-else>
      Welcome <b>{{ selectedAddress }}</b
      >, you have {{ balance.toString() }} {{ tokenData.symbol }}
      .
    </p>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  tokenData: {
    name: string
    symbol: string
  }
  selectedAddress: string
  balance: any
}>()
</script>
