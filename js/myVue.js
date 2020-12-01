
class Compile{
    constructor(el, vm) {
        // 判断el是否是一个元素节点对象
        // el：'#app'
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        // console.log('el', this.el);
        this.vm = vm

        // 编译el下的所有的子节点：
        // 1, 利用fragment碎片:在碎片中编译好所有的子节点之后，再添加到页面中，而不是一个子节点一个子节点的编译添加，会因此回流和重绘，影响性能
        const fragment = this.node2Fragment(this.el)
        // console.log('fragment', fragment);
        // 2, 编译模板
        this.compile(fragment)
        // 3, 重新将编译后的子节点追加到根节点上
    }
    // 2, 编译模板
    compile(fragment) {
        // 获取到fragment中的所有的子节点
        const childNodes = fragment.childNodes
        // console.log('childNodes', childNodes);
        ;[...childNodes].forEach(child => {
            // console.log('child', child);
            // 元素节点和文本节点分别处理
            if(this.isElementNode(child)) {
                // 元素节点
                // console.log('elementNode', child);
                this.compileElement(child)
            } else {
                // 文本节点
                // console.log('textNode', child);
                this.compileText(child)
            }
// ?????????????
            // 对child的子节点递归操作
            if(child.childNodes && child.childNodes.length) {
                this.compile(child)
            }
        });
    }
    // 编译文本节点
    compileText(node) {

    }
    // 编译元素节点
    // 编译元素节点的目的：对节点上的指令进行编译。例如v-text v-html v-model等
    compileElement(node) {
        // console.log('node', node);
        const attributes = node.attributes
        // console.log('attributes', attributes);
        ;[...attributes].forEach(attr => {
            // console.log('attr', attr);
            const {name, value} = attr
            console.log('name', name);
            // 判断当前的name是否是一个指令
            if(this.isDirective(name)) {
                // 对指令操作：v-text v-html v-model v-on:click 等
                const [, directive] = name.split('-')   //text html model on:click
                const [dirName, dirEvent] = directive.split(':') //text html model on
                
                // 根据不同的指令处理不同的事件
                // 传入参数this.vm拿到data中的值
                conpileUtil[dirName](node, value, this.vm, dirEvent)
            }
        })
    }
    // 判断是否是以v-开头的
    isDirective(attrName) {
        return attrName.startsWith('v-')
    }
    // 1, 利用文档碎片，拿到所有的子节点
    node2Fragment(el) {
        // 首先，创建fragment
        const frag = document.createDocumentFragment()
        let firstChild
        // 
        while(firstChild = el.firstChild) {
            // 将所有的子节点保存到文档碎片中
            frag.appendChild(firstChild)
        }
        // 返回fragment
        return frag
    }

    // 判断是否是元素节点
    isElementNode(node) {
        // 元素节点的nodeType 为1，别的还有文本节点之类的
        return node.nodeType === 1
    }
}

class myVue{
    constructor(options) {
        // 首先绑定值
        this.$options = options
        this.$el = options.el
        this.$data = options.data

        if(this.$el) {
            // observer 劫持监听数据

            // compile 指令的解析器
            // 这里注意一点，compile是一个类，而类不存在变量提升，所以需要在用之前申明
            // 参数是el、当前的myVue实例
            new Compile(this.$el, this)
        }

    }
}