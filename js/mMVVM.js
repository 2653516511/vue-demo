
class mMVVM{
    constructor(options) {
        // 首先绑定值
        this.$options = options || {}
        this.$el = options.el
        var data = this.$data = options.data

        if(this.$el) {
            // 接下来做两件事：

            // 1，observer 劫持监听数据 数据的观察者
            new Observer(this.$data)

            // 2，compile 指令的解析器
            // es6 中的class：这里注意一点，compile是一个类，而类不存在变量提升，所以需要在用之前申明，而不是先使用再申明
            // 参数是el、当前的mMVVM实例
            new Compile(this.$el, this)
        }

    }
}