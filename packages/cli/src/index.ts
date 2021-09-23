#!/usr/bin/env node
import cac from 'cac'
import { version } from '../package.json'
import init from './action/init'
import boot from './action/boot'
import run from './action/run'

const skr = cac('skr')

skr.command('init', '初始化脚手架').action(init)

skr.command('boot', '收集项目依赖').action(boot)

skr.command('run <script>', '执行项目脚本').action(run)

skr.version(version)

skr.help()

skr.parse()
