# skr

## Install
```sh
npm install @calibur/skr-cli -g
```

## Usage
```sh
skr init
```

```sh
skr -h
```

## Step
1. 使用`skr init`初始化 CLI
  - 参数 --url 可以指定初始化的模板，参考：[init.json](https://github.com/calibur-tv/skr/blob/main/packages/template/init.json)
2. 使用`skr template`创建自己的模板
  - 参数详见`skr template -h`
  - `url` 设置为模板所在`npm`仓库的地址，`#`后面为模板所在的目录，参考：[init.json](https://github.com/calibur-tv/skr/blob/main/packages/template/init.json#L7)
2. 使用`skr create`创建模板文件
  - 参数详见`skr create -h`
3. 使用`skr run`运行命令行脚本
4. 使用`skr release`更新版本

更多提供的脚本，使用`skr -h`查看