#!/usr/bin/env node
import cac from 'cac'
import { version as V } from '../package.json'
import template from './action/template'
import version from './action/version'
import upgrade from './action/upgrade'
import deploy from './action/deploy'
import create from './action/create'
import init from './action/init'
import boot from './action/boot'
import run from './action/run'
import add from './action/add'

const skr = cac('skr')

skr
  .command('init', '初始化脚手架')
  .option('--url [url]', '初始化文件')
  .option('--pkg [pkg]', '初始化项目')
  .action(init)

skr.command('upgrade', '升级脚手架').action(upgrade)

skr
  .command('create [name]', '创建项目')
  .option('--loc [loc]', '输出目录')
  .option('--force', '重新下载模板')
  .option('--remove', '清空目录')
  .option('--template [template]', '模板名称')
  .action(create)

skr
  .command('template [name] [...url]', '添加模板')
  .option('--remove', '删除模板')
  .option('--list', '模板列表')
  .option('--desc [desc]', '模板描述')
  .action(template)

skr
  .command('boot [name]', '收集项目依赖')
  .option('--clean', '清理 node_modules')
  .option('--self', '是否包含当前项目')
  .action(boot)

skr
  .command('run [script]', '执行项目脚本')
  .option('--scope [scope]', '项目名称')
  .action(run)

skr
  .command('add [...name]', '增加项目依赖')
  .option('--scope [scope]', '项目名称')
  .option('--dev, -D', '添加包到 devDependencies')
  .option('--peer, -P', '添加包到 peerDependencies')
  .option('--exact, -E', '锁死版本')
  .action(add)

skr
  .command('version [name]', '发布新版本')
  .option('--release [release]', '自定义版本号')
  .option('--self', '更新自己的版本')
  .action(version)

skr
  .command('deploy', '部署项目')
  .option('--script [script]', '部署脚本')
  .option('--project [project]', '项目名')
  .option('--command [command]', '脚本名')
  .action(deploy)

skr.version(V)

skr.help()

skr.parse()
