<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="text-center hero-content">
      <div class="max-w-md">
        <h1 class="mb-5 text-5xl font-bold">Hello <%= name.paramCase %></h1>
        <p class="mb-5">No Ethereum wallet was detected. Please install</p>
        <a
          href="http://metamask.io"
          class="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          MetaMask
        </a>
      </div>
    </div>
  </div>
</template>
