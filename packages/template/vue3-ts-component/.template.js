const init = async (opts) => {
  console.log('this hook called before check version', opts);
}

const copy = async (opts) => {
  console.log('this hook called before copy files', opts);
  return {
    currentTime: Date.now()
  }
}

const done = async (opts) => {
  console.log('this hook called after copy files', opts);
}

module.exports = {
  init,
  copy,
  done
}
