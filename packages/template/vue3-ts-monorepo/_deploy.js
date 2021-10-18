const beforeUnlinkLerna = async ({ project, command }, { exec, info }) => {
  // do something
}

const afterUnlinkLerna = async ({ project, command }, { exec, info }) => {
  // do something
}

module.exports = {
  beforeUnlinkLerna,
  afterUnlinkLerna
}