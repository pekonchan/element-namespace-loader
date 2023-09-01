const loaderUtils = require('loader-utils')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require("@babel/generator").default
module.exports = function changePrefixLoader(source) {
    const { prefix = 'el-', replace = 'ex-' } = loaderUtils.getOptions(this) || {}
    const result = handleSource(source, prefix, replace)
    return result.code
}
function handleSource(source, prefix, replace) {
    const ast = parser.parse(source)
    traverse(ast, {
        CallExpression(path) {
        path.traverse({
            Literal(path) {
            const node = path.node
            // 普通字符串替换
            if (typeof node.value === 'string' && node.value.indexOf(prefix) !== -1 && !canChange(path)) {
                if (node.value !== 'el-menu-collapse-transition') { // TODO 先特殊处理这个内部组件
                const reg = new RegExp(`(^|(\\s)+|(\\.)+)${prefix}`, 'g')
                // const reg = new RegExp(`(^|(\\s)+)el-(?!icon)`, 'g')
                node.value = node.value.replace(reg, `$1${replace}` )
                }
            }
            path.replaceWith(node)
            },
            RegExpLiteral(path) {
            const node = path.node
            if (node.pattern.indexOf(prefix) !== -1) {
                const reg = new RegExp(prefix, 'g')
                node.extra.raw = node.extra.raw.replace(reg, replace)
                node.pattern = node.pattern.replace(reg, replace)
            }
            path.replaceWith(node)
            }
        })
        }
    })
    return generate(ast)
}
function canChange(path) {
    const parenNode = path.parent
    if (parenNode.type !== 'CallExpression') return false
    if (parenNode.callee && parenNode.callee.name === 'h' || parenNode.callee.name === '_c') {
        return true
    }
    return false
}