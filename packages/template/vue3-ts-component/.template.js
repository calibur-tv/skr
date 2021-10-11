const beforeCheckVersion = async (opts) => {
  console.log('this hook called before check version', opts);
}

const afterCheckVersion = async (opts) => {
  console.log('this hook called after check version', opts);
  return {
    currentTime: Date.now()
  }
}

const beforeCopyFiles = async (opts, files) => {
  console.log('this hook called before copy files', opts);
  if (opts.isMonorepo) {
    return files.filter(_ => !_.startsWith('_'))
  }
}

const afterCopyFiles = async (opts) => {
  console.log('this hook called after copy files', opts);
}

module.exports = {
  beforeCheckVersion,
  afterCheckVersion,
  beforeCopyFiles,
  afterCopyFiles
}
