# element-namespace-loader
A webpack loader to change element-ui className prefix

一个用来改变`element-ui`的组件渲染成HTML后的类名前缀的`webpack loader` 。即把`element-ui`专属的`el-`开头的类名改成你想要的命名空间。

> 该工具代码是对`change-prefix-loader`的改造，主要是`change-prefix-loader`排除了对`element-ui`的icon的处理，而我这个`element-namespace-loader`则会把icon的类名也处理掉

例如, 你设置的命名空间为`ex-`，那么`<el-input></el-input>`组件渲染成HTML后
**改之前**
```
<div class="el-input">
    <input type="text" class="el-input__inner">
</div>
```
**改之后**
```
<div class="ex-input">
    <input type="text" class="ex-input__inner">
</div>
```

# Install
```
npm i element-namespace-loader -D

yarn add element-namespace-loader -D

pnpm add element-namespace-loader -D
```

# Usage
对安装下来的`element-ui`源码包里的`js`进行使用该`webpack loader`。 目标就是设置`webpack`的`rule`如下：
```
{
    test: /\.js$/,
    loader: 'element-namespace-loader',
    include: path.resolve(__dirname, '../node_modules/element-ui/lib'),
    options: {
        replace: 'ex-',
    }
}
```

具体设置情况举例：

**针对vue-cli 2.x的项目**
对`webpack`的`module`中的`rules`添加一个新的匹配规则，如下
```
module: {
    rules: [
        {
            test: /\.js$/,
            loader: 'element-namespace-loader',
            include: path.resolve(__dirname, '../node_modules/element-ui/lib'),
            options: {
                replace: 'ex-', // 这就是你要自定义命名空间
            }
        },
        // ... 其他规则
    ]
}
```
该脚手架工程默认webpack的配置在 `build/webpack.base.conf.js`中

**针对vue-cli 3.x（含）以上的项目**
改动`vue.config.js`
```
module.exports = {
    chainWebpack: config => {
        config.module
            .rule('element-namespace')
            .test(/\.js$/)
            .include.add(path.resolve(__dirname, './node_modules/element-ui/lib'))
            .end()
            .use('element-namespace')
            .loader('element-namespace-loader')
            .options({
                replace: 'ex-' // 这就是你要自定义命名空间
            })
            .end()
   
```

# 注意
该`loader`只会改变`element-ui`组件渲染成`HTML`上的类名前缀，而`element-ui`自己的样式选择器的类名前缀，需要配合该 [postcss-change-prefix-namespace](https://github.com/pekonchan/postcss-change-prefix-namespace) 插件完成。