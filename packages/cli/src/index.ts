#!/usr/bin/env node
import cac from 'cac'
import { version } from '../package.json'
import init from './action/init'

const skr = cac('skr')

skr.command('init', '初始化脚手架').action(init)

skr.version(version)

skr.help()

skr.parse()
