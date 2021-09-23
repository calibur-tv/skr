#!/usr/bin/env node
import cac from 'cac'
import { version } from '../package.json'
import publish from './action/publish'
import init from './action/init'
import boot from './action/boot'
import run from './action/run'
import add from './action/add'

const skr = cac('skr')

skr.command('init', '初始化脚手架').action(init)

skr.command('boot', '收集项目依赖').action(boot)

skr.command('run <script>', '执行项目脚本').action(run)

skr
  .command('add <name>', '增加项目依赖')
  .option('--dev', '添加包到 devDependencies')
  .option('--peer', '添加包到 peerDependencies')
  .option('-D', '添加包到 devDependencies')
  .option('-P', '添加包到 peerDependencies')
  .action(add)

skr.command('publish', '收集项目依赖').action(publish)

skr.version(version)

skr.help()

skr.parse()
