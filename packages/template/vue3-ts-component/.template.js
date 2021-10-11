const beforeCheckVersion = async (opts, axios) => {
  // console.log('this hook called before check version', opts, axios);
}

const afterCheckVersion = async (opts, axios) => {
  // console.log('this hook called after check version', opts, axios);
  return {
    currentTime: Date.now()
  }
}

const beforeCopyFiles = async (opts, files, axios) => {
  // console.log('this hook called before copy files', opts, axios);
  if (opts.isMonorepo) {
    return files.filter(_ => !_.startsWith('_'))
  }
}

const afterCopyFiles = async (opts, axios) => {
  // console.log('this hook called after copy files', opts, axios);
}

module.exports = {
  beforeCheckVersion,
  afterCheckVersion,
  beforeCopyFiles,
  afterCopyFiles
}
