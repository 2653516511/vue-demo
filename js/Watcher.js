class Watcher{
    constructor(vm, exp, cb) {
        this.vm = vm
        this.exp = exp
        this.cb = cb
        // 拿到旧的value
        this.oldVal = this.getOldVal()
    }
    // watcher与dep建立连接、拿到旧的value
    getOldVal() {
        // 把当前的watcher挂载到当前的dep实例上
        Dep.target = this
        const oldVal = compileUtil.getVal(this.exp, this.vm)
        // 获取到旧的值之后，删除原来挂载的watcher
        Dep.target = null
        return oldVal
    }
    // 更新视图的方法
    update() {
        const newVal = compileUtil.getVal(this.exp, this.vm)
        if(newVal !== this.oldVal) {
            this.cb(newVal)
        }
    }
}