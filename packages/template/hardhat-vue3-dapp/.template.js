const beforeCheckVersion = async (opts, fetch) => {
  // console.log('this hook called before check version', opts, fetch);
  const resp = await fetch('https://raw.githubusercontent.com/nomiclabs/hardhat/master/packages/hardhat-core/src/internal/hardhat-network/stack-traces/solidityTracer.ts')
  const line = resp.split('\n').find(_ => _.includes('SUPPORTED_SOLIDITY_VERSION_RANGE'))

  return {
      solidity: line.split('"')[1].replace(/<|>|=/g, '')
  }
}

const afterCheckVersion = async (opts, fetch) => {

}

const beforeCopyFiles = async (opts, files, fetch) => {
  // console.log('this hook called before copy files', opts, fetch);
  if (opts.isMonorepo) {
      return files.filter(_ => !_.startsWith('_'))
  }
}

const afterCopyFiles = async (opts, fetch) => {
  // console.log('this hook called after copy files', opts, fetch);
}

module.exports = {
  beforeCheckVersion,
  afterCheckVersion,
  beforeCopyFiles,
  afterCopyFiles
}
