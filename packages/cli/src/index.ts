#!/usr/bin/env node
import cac from 'cac'
import { version } from '../package.json'
import template from './action/template'
import release from './action/release'
import deploy from './action/deploy'
import create from './action/create'
import init from './action/init'
import boot from './action/boot'
import run from './action/run'
import add from './action/add'

const skr = cac('skr')

skr.command('init', '初始化脚手架').action(init)

skr
  .command('create <name>', '创建项目')
  .option('--template [template]', '模板名称')
  .option('--dest [dest]', '输出目录')
  .option('--force, -R', '清空目录')
  .option('--no-cache', '重新下载模板')
  .action(create)

skr
  .command('template [name] [...url]', '添加模板')
  .option('--remove, -R', '删除模板')
  .option('--list, -L', '模板列表')
  .option('--desc [desc]', '模板描述')
  .action(template)

skr
  .command('boot [name]', '收集项目依赖')
  .option('--clean, -C', '清理 node_modules')
  .action(boot)

skr
  .command('run <script>', '执行项目脚本')
  .option('--name [name]', '项目名称')
  .action(run)

skr
  .command('add [...name]', '增加项目依赖')
  .option('--dev, -D', '添加包到 devDependencies')
  .option('--peer, -P', '添加包到 peerDependencies')
  .option('--exact, -E', '锁死版本')
  .action(add)

skr
  .command('release [name]', '发布新版本')
  .option('--release, -R [release]', '自定义版本号')
  .option('--self, -S', '更新自己的版本')
  .action(release)

skr.command('deploy', '部署脚本').action(deploy)

skr.version(version)

skr.help()

skr.parse()
