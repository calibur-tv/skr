#!/usr/bin/env node
import cac from 'cac'
import { version } from '../package.json'

const skr = cac('skr')

skr.command('init', '初始化脚手架').action(() => {
  console.log('hello skr~')
})

skr.version(version)

skr.help()

skr.parse()
