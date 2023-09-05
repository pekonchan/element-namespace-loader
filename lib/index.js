const loaderUtils = require('loader-utils')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require("@babel/generator").default

function canChange(path) {
    const parenNode = path.parent
    if (parenNode.type !== 'CallExpression') return false
    if (parenNode.callee && parenNode.callee.name === 'h' || parenNode.callee.name === '_c') {
        return true
    }
    return false
}

module.exports = function changeNamespaceLoader(source) {
    const { prefix = 'el-', replace = 'ex-' } = loaderUtils.getOptions(this) || {}
    const ast = parser.parse(source)
    traverse(ast, {
        CallExpression(path) {
            path.traverse({
                Literal(path) {
                    const node = path.node
                    const pattern = new RegExp(`(^|(\\s)+|(\\.)+)${prefix}`, 'g')
                    // 普通字符串替换
                    if (typeof node.value === 'string' && pattern.test(node.value) && !canChange(path)) {
                        if (node.value !== 'el-menu-collapse-transition') { // TODO 先特殊处理这个内部组件
                            node.value = node.value.replace(pattern, `$1${replace}` )
                        }
                    }
                    path.replaceWith(node)
                },
                RegExpLiteral(path) {
                    const node = path.node
                    if (node.pattern.indexOf(prefix) !== -1 && node.pattern.indexOf(replace) === -1) {
                        const reg = new RegExp(prefix, 'g')
                        node.extra.raw = node.extra.raw.replace(reg, replace)
                        node.pattern = node.pattern.replace(reg, replace)
                    }
                    path.replaceWith(node)
                }
            })
        }
    })
    const result = generate(ast)
    return result.code
}
