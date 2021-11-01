# skr 📦

一个基于 lerna 的 monorepo 脚手架，也是一个基于 ejs 的 template 管理器

## Why? ✨

- lerna 的命令众多参数复杂，不利于初学者.
- lerna 无法在 CI 中精准的控制发布依赖.
- Yarn2 的 monorepo 方案在 CI 中要依赖 remote-npm 更加麻烦.

## Quick Start

1.安装 CLI 到全局

```sh
npm install @calibur/skr-cli -g
```

2.初始化 CLI 依赖

```sh
skr init
```

> 你可以通过 `skr init --url=<远程配置文件地址>` 来使用你自己的模板列表

3.查看模板列表

```sh
skr template --list
```

4.创建项目

```sh
skr create <project-name> --template=<template-name>
```

## Commands

查看所有指令

```sh
skr -h
```

- [skr init](https://github.com/calibur-tv/skr#skr-init)
- [skr upgrade](https://github.com/calibur-tv/skr#skr-upgrade)
- [skr create](https://github.com/calibur-tv/skr#skr-create)
- [skr template](https://github.com/calibur-tv/skr#skr-template)
- [skr boot](https://github.com/calibur-tv/skr#skr-boot)
- [skr run](https://github.com/calibur-tv/skr#skr-run)
- [skr add](https://github.com/calibur-tv/skr#skr-add)
- [skr version](https://github.com/calibur-tv/skr#skr-version)
- [skr deploy](https://github.com/calibur-tv/skr#skr-deploy)

查看单个指令详情

```sh
skr create -h
```

### `skr init`

初始化脚手架依赖（yarn 和 lerna），可以通过 `--url=<配置文件地址>` 来修改默认的配置文件列表。

### `skr upgrade`

用于升级脚手架，未来将会集成在其它命令中。

### `skr create`

创建项目，你可以选择自己创建一个模板，如果执行`create`的当前目录是 lerna monorepo 的根目录，则会自动把项目添加到 workspace。

### `skr template`

本地模板的`CURD`操作

### `skr boot`

构建某个 package 的所有依赖，可通过`--clean` 来删除 `node_modules`（类似`lerna clean`），但是`boot`会根据所选项目依赖的拓扑结构去构建本地依赖，减少了麻烦。

### `skr run`

执行某个 package 的`script`，如：`skr run dev --name=<project-name>`，这样就不需要跳转到具体的项目目录去执行脚本了。

### `skr add`

类似于`lerna add`，简化了命令无需输入 `scope`，取而代之的是命令行选项来选择。

### `skr version`

类似于`lerna version`，但只会发布你所选的项目，并根据选项依赖的拓扑结构执行每个依赖的`publish`命令。

### `skr deploy`

私有发布时，最好的方式是删除`lerna.json`和`package.json`里的`workspaces`，这样项目就是一个`multirepo`，所有依赖都会走远程`npm`。

## Todos

- [ ] `skr init --url`支持 extends 语法
- [ ] 调整各个命令的名称和参数，减少和`leran`的差异。

License (MIT) 📚
