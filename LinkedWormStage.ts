const w : number = window.innerWidth, h = window.innerHeight, NODES = 4
class LinkedWormStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    linkedWorm : LinkedWorm = new LinkedWorm()

    animator : LWAnimator = new LWAnimator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.context.strokeStyle = '#2ecc71'
        this.context.lineWidth = Math.min(w, h) / 60
        this.context.lineCap = 'round'
        this.linkedWorm.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedWorm.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedWorm.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }
}

class LWState {
    scales : Array<number> = [0, 0, 0, 0]

    prevScale : number = 0

    j : number = 0

    dir : number = 0

    update(stopcb : Function) {
        this.scales[this.j] += 0.1 * this.dir
        if (Math.abs(this.scales[this.j] - this.prevScale) > 1) {
            this.scales[this.j] = this.prevScale + this.dir
            this.j += this.dir
            if (this.j == this.scales.length || this.j == -1) {
                this.j -= this.dir
                this.dir = 0
                this.prevScale = this.scales[this.j]
                stopcb()
            }
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class LWAnimator {

    animated : boolean = false

    interval : number

    start(cb : Function) {
        if(!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LWNode {

    next : LWNode

    prev : LWNode

    state : LWState = new LWState()

    constructor(private i : number) {
        this.addNeighbor()
    }


    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / (3 * NODES)
        const r : number = gap/2
        const getDeg : Function = (scale : number) => 180 + Math.floor(180 * scale)
        context.save()
        context.translate(this.i * (3 * gap), h/2)
        context.beginPath()
        context.moveTo(gap * this.state.scales[1], 0)
        context.lineTo((gap) * this.state.scales[0], 0)
        context.stroke()
        context.beginPath()
        const start : number = getDeg(this.state.scales[2])
        for (var i = start; i <= getDeg(this.state.scales[1]); i++) {
            const x : number = (gap+r) + r * Math.cos(i * Math.PI/180), y : number = r * Math.sin(i * Math.PI/180)
            if (i == start) {
                context.moveTo(x, y)
            }
            else {
                context.lineTo(x, y)
            }
        }
        context.stroke()
        context.beginPath()
        context.moveTo(2 * gap + gap * this.state.scales[3], 0)
        context.lineTo(2 * gap + gap * this.state.scales[2], 0)
        context.stroke()
        context.restore()
    }

    addNeighbor() {
        if (this.i < NODES - 1) {
            this.next = new LWNode(this.i + 1)
            this.next.prev = this
        }
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) : LWNode {
        var curr : LWNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedWorm {

    curr : LWNode = new LWNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            console.log(this.curr)
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}

const initLinkedWormStage : Function = () => {
    const stage : LinkedWormStage = new LinkedWormStage()
    stage.render()
    stage.handleTap()
}
