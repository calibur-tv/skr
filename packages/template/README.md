# skr-cli 默认加载的模板列表

## Features
- 支持`ejs`语法
- 默认支持通过`ejs`语法修改`package.json`里的依赖版本号，参考：[template](https://github.com/calibur-tv/skr/blob/main/packages/template/vue3-ts-component/package.json#L16)
- 默认注入项目名到`ejs`模板：[用例](https://github.com/calibur-tv/skr/blob/main/packages/template/vue3-ts-component/vite.config.ts#L10)
    - `name.pascalCase` --> "TestString"
    - `name.paramCase` --> "test-string"
    - `name.camelCase` --> "testString"
    - `name.capitalCase` --> "Test String"
- 默认注入`isMonorepo`变量到`ejs`模板，[用例](https://github.com/calibur-tv/skr/blob/main/packages/template/vue3-ts-component/tsconfig.json)
- 在模板文件夹根目录添加`.template.js`文件，即可注入自定义变量，参考：[template](https://github.com/calibur-tv/skr/tree/main/packages/template/vue3-ts-component/.template.js)，[用例](https://github.com/calibur-tv/skr/blob/main/packages/template/vue3-ts-component/src/App.vue#L3)
- `ejs`变量示例：
```javascript
{
  isMonorepo: '<boolean>',
  ...{/* package.json versions */},
  ...{/* .template.js custom vars */}
}
```