const beforeCheckVersion = async (opts, fetch) => {
  // console.log('this hook called before check version', opts, fetch);
}

const afterCheckVersion = async (opts, fetch) => {
  // console.log('this hook called after check version', opts, fetch);
  return {
    currentTime: Date.now()
  }
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
