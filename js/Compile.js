const compileUtil = {
    // view驱动data函数
    getNewval(exp, vm, targetVal) {
        // console.log('input-value', exp);
        const expArr = exp.split('.')
        return expArr.reduce((data, currentVal, currentIndex) => {
            // console.log('current', currentVal);
            if(currentIndex < expArr.length - 1) {
                return data[currentVal]
            } else {
                data[currentVal] = targetVal
            }
            
        }, vm.$data)
        
    },
    // 对value进行处理，拿到最终的value
    getVal(exp, vm) {
        return exp.split('.').reduce((data, currentVal) => {
            // console.log('data', data);
            return data[currentVal]
        }, vm.$data)
    },
    // text 绑定watcher的newVal的处理
    getContentVal(exp, vm) {
        return exp.replace(/\{\{(.*?)\}\}/g, (...args) => {
            
            return this.getVal(args[1], vm)
        })
    },
    // exp: message
    text(node, exp, vm) {  
        // 从data中取到exp对应的值

        let value
        // 判断是{{}}的文本，还是指令的文本
        // 是{{}}的文本
        if(exp.indexOf('{{') !== -1) {
            // 这里的关键点是拿到{{}}里面的值，使用如下方法
            value = exp.replace(/\{\{(.*?)\}\}/g, (...args) => {
                // console.log(args);
                // 订阅数据变化，绑定更新函数
                new Watcher(vm, args[1], () => {
                    this.updater.textUpdater(node, this.getContentVal(exp, vm))
                })
                
                return this.getVal(args[1], vm)
            })
        } else {
            // v-text='message'  v-text='person.name'
            // const value = vm.$data[exp]  //这个操作只能拿到message类似的值，而person.name类似的值拿不到
            value = this.getVal(exp, vm)
        }
        
        this.updater.textUpdater(node, value)

    },
    html(node, exp, vm) {
        const value = this.getVal(exp, vm)
        // 订阅数据变化，绑定更新函数
        new Watcher(vm, exp, (newVal) => {
            this.updater.htmlUpdater(node, newVal)
        })

        this.updater.htmlUpdater(node, value)
    },
    model(node, exp, vm) {
        const value = this.getVal(exp, vm)
        // 订阅数据变化，绑定更新函数
        new Watcher(vm, exp, (newVal) => {
            this.updater.modelUpdater(node, newVal)
        })
        node.addEventListener('input', (targetNode) => {
            const targetVal = targetNode.target.value
            if(value === targetVal) {
                return
            }

            this.getNewval(exp, vm, targetVal)
        })
        this.updater.modelUpdater(node, value)
    },
    on(node, exp, vm, eventName) {
        // exp: handleClick
        // console.log('exp', exp);
        // console.log('eventName', eventName);
        const expFn = vm.$options.methods[exp]
        // console.log('expFn', expFn);
        
        // 给节点绑定监听事件
        // 这里注意给expFn绑定this为vm，不然就是node
        node.addEventListener(eventName, expFn.bind(vm), false)

    },
    bind(node, exp, vm, attrName) {
        // 绑定属性的操作
    },
    // updater方法：更新节点的数据的对象。渲染页面
    updater: {
        textUpdater(node, value) {
            // 给node节点的文本赋值
            node.textContent = value
        },
        htmlUpdater(node, value) {
            node.innerHTML = value
        },
        modelUpdater(node, value) {
            node.value = value
        }
    }
}
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
        this.el.appendChild(fragment)
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
        // {{}}
        const nodeText = node.textContent
        // console.log('nodeText', nodeText);
        // 正则匹配{{}}
        const regexp = new RegExp(/\{\{(.*?)\}\}/)
        if(regexp.test(nodeText)) {
            // console.log('nodeText', nodeText);
            compileUtil['text'](node, nodeText, this.vm)
        }

    }
    // 编译元素节点
    // 编译元素节点的目的：对节点上的指令进行编译。例如v-text v-html v-model等
    compileElement(node) {
        // console.log('node', node);
        // 拿到node节点上的属性，进行操作
        const attributes = node.attributes
        // console.log('attributes', attributes);
        ;[...attributes].forEach(attr => {
            // console.log('attr', attr);
            const {name, value} = attr
            // console.log('name', name);
            // 判断当前的name是否是一个指令
            if(this.isDirective(name)) {
                // 对指令操作：v-text v-html v-model v-on:click v-bind: 等
                const [, directive] = name.split('-')   //text html model on:click
                const [dirName, dirEvent] = directive.split(':') //text html model on
                
                // 更新数据， 数据驱动视图
                // 根据不同的指令处理不同的事件
                // 传入参数this.vm拿到data中的值
                compileUtil[dirName](node, value, this.vm, dirEvent)

                // 删除元素节点上 的指令属性
                node.removeAttribute('v-' + directive)
            } else if (this.isEventName(name)) { 
                // 处理事件名为 @click='handleClick'
                let [, eventName] = name.split('@')
                compileUtil['on'](node, value, this.vm, eventName)
            }
        })
    }
    // 事件@click='...' 的函数
    isEventName(attrName) {
        return attrName.startsWith('@')
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
