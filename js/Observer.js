var uid = 0
class Dep{
    constructor() {
        this.id = uid++
        // 观察者watcher数组
        this.subs = []
    }
    // 1, 收集观察者
    addSub(watcher) {
        this.subs.push(watcher)
    }
    // 2, 通知观察者更新
    notify() {
        console.log('notify-watcher', this.subs);
        this.subs.forEach(w => w.update())
    }
    append() {
        Dep.target.addDep(this)
    }
}
Dep.target = null


class Observer {
    constructor(data) {
        this.observer(data)
    }
    observer(data) {
        // data必须是一个对象   typeof null === 'object'
        if(data && typeof data === 'object') {
            // console.log('keys', Object.keys(data));
            Object.keys(data).forEach(key => {
                // console.log('key', key);
                this.defineReactive(data, key, data[key])
            })
        }
    }
    // 劫持数据
    defineReactive(obj, key, value) {
        // 递归操作，对data中的每一个对象都进行 响应式 操作
        this.observer(value)

        // 给data中的每一层的数据都建立Dep
        const dep = new Dep()

        // 劫持
        Object.defineProperty(obj, key, {
            configurable: false,
            enumerable: true,
            get() {
                // 订阅数据变化时，往dep中添加观察者，收集依赖
                // Dep.target && dep.addSub(Dep.target)
                Dep.target && dep.append()    

                return value
            },
            // set(newValue) {
            //     // 这里需要注意，如果重新赋值一个新的对象，也需要添加劫持，所以这里还需要调用
            //     // 如果这样写，那这里的this是Object, 而不是class。所以改为箭头函数
            //     this.observer(newValue)
            //     if(value !== newValue) {
            //         value = newValue
            //     }
            // }
            set: (newValue) => {
                this.observer(newValue)
                if(value === newValue) {
                    return
                }
                value = newValue
                // 改变数据之后，observer->Dep 通知变化
                dep.notify()
            }
        })
    }

}