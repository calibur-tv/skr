#!/usr/bin/env node
import cac from 'cac'
import { version } from '../package.json'
import init from './action/init'
import boot from './action/boot'

const skr = cac('skr')

skr.command('init', '初始化脚手架').action(init)

skr.command('boot', '收集项目依赖').action(boot)

skr.version(version)

skr.help()

skr.parse()
