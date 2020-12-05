/**
 * watcher就做两件事：与dep建立联系（初始化阶段）、通知updater方法更新视图（更新阶段）
 */
class Watcher{
    constructor(vm, exp, cb) {
        this.vm = vm
        this.exp = exp
        this.cb = cb
        this.depIds = {}
        // 拿到初始化的value
        this.oldVal = this.getOldVal()
    }
    // watcher与dep建立连接
    addDep(dep) {
        // console.log('dep', dep);
        if(!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this)
            this.depIds[dep.id] = dep
        }
    }
    
    // 拿到初始化的value
    getOldVal() {
        // 把当前的watcher挂载到当前的dep实例上
        Dep.target = this
        // 获取到初始化的值
        const oldVal = compileUtil.getVal(this.exp, this.vm)
        // 获取到初始化的值之后，删除原来挂载的watcher
        // Dep.target = null
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