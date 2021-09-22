import { spawn } from 'child-process-promise'

const exec = (action: string, log = true): Promise<any> => {
  const arr: string[] = action.split(' ')
  const promise = spawn(arr.shift() as string, arr)
  const childProcess = promise.childProcess

  if (log && childProcess?.stdout) {
    childProcess.stdout.on('data', function (data) {
      console.log(data.toString())
    })
  }

  if (log && childProcess?.stderr) {
    childProcess.stderr.on('data', function (data) {
      console.log(data.toString())
    })
  }

  return promise
}

export { exec }
