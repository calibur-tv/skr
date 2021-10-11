const beforeCopyFiles = async (opts, files) => {
  // console.log('this hook called before copy files', opts);
  if (opts.isMonorepo) {
    return files.filter(_ => !_.startsWith('.'))
  }
}

module.exports = {
  beforeCopyFiles
}
