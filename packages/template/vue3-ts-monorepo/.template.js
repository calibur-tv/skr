const beforeCopyFiles = async (opts, files) => {
  // console.log('this hook called before copy files', opts);
  return files.filter(_ => !_.startsWith('.'))
}

module.exports = {
  beforeCopyFiles
}
