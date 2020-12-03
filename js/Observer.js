
class Observer {
    constructor(data) {
        this.observer(data)
    }
    observer(data) {
        // data必须是一个对象
        if(data && typeof data === 'object') {
            // console.log('keys', Object.keys(data));
            Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key])
            })
        }
    }
    defineReactive(obj, key, value) {
        // 递归
        this.observer(value)
        // 劫持
        Object.defineProperty(obj, key, {
            configurable: false,
            enumerable: true,
            get() {
                // 订阅数据变化时，往dep中添加观察者，收集依赖

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
                if(value !== newValue) {
                    value = newValue
                }
            }
        })
    }

}