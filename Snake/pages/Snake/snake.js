
var nodeWH = 10
var direction = 'right'
var timer = null
var nodes=[]
var food = null
var context = wx.createContext()
var lastPoint = null
var isGameOver = false
var that 
var score = 0

function Node(x,y){
  this.x = x;
  this.y = y;
}

function createSnake(){
  nodes.splice(0, nodes.length)
  for (var i = 4; i >= 0; i--) {
    var node = new Node(nodeWH * (i + 0.5), nodeWH * 0.5)
    nodes.push(node);
  }
}

function createFood(){
  var x = parseInt(Math.random() * 24) * nodeWH + nodeWH * 0.5
  var y = parseInt(Math.random() * 34) * nodeWH + nodeWH * 0.5

  //如果食物的坐标在蛇身上，则重新创建
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    if (node.x == x && node.y == y) {
      createFood()
      return
    }
  }
  food = new Node(x,y)
}

//绘制蛇与食物
function draw(){
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    if (i == 0) {
      context.setFillStyle('#ff0000')
    } else {
      context.setFillStyle('#000000')
    }
    context.beginPath()
    context.rect(node.x, node.y, nodeWH, nodeWH)
    context.closePath()
    context.fill()
  }

  context.setFillStyle('#0000ff')
  context.beginPath()
  context.rect(food.x, food.y, nodeWH, nodeWH)
  context.closePath()
  context.fill()
  
  wx.drawCanvas({
    canvasId: 'snakeCanvas',
    actions: context.getActions()
  })
}

//游戏结束
function gameOver(){
  isGameOver = true
  clearInterval(timer)
  wx.showModal({
    title:'Game Over',
    content:'总得分：'+ score +'，不服再来?',
    confirmText:'不服',
    success:function(e){
      if (e.confirm == true) {
        startGame()
      } else {
        console.log('cancel')
        that.setData({
          btnTitle:'开始'
        })
      }
    }
  })
}

//是否吃到食物
function isEatedFood(){
  var head = nodes[0]
  if (head.x == food.x && head.y == food.y) {
    score++
    nodes.push(lastPoint)
    createFood()
  }
}

//是否撞到墙壁或者撞到自己的身体
function isDestroy(){
  var head = nodes[0]
  for (var i = 1; i < nodes.length; i++) {
    var node = nodes[i]
    if (head.x == node.x && head.y == node.y) {
      gameOver()
    }
  }
  if (head.x < 5 || head.x > 245) {
    gameOver()
  }
  if (head.y < 5 || head.y > 345) {
    gameOver()
  }
}

function moveEnd(){
  isEatedFood()
  isDestroy()
  draw()
}

function move(){
    lastPoint = nodes[nodes.length - 1]
    var node = nodes[0]
    var newNode = {x: node.x, y: node.y}
    switch (direction) {
      case 'up':
        newNode.y -= nodeWH;
      break;
      case 'left':
        newNode.x -= nodeWH;
      break;
      case 'right':
        newNode.x += nodeWH;
      break;
      case 'down':
        newNode.y += nodeWH;
      break;
  } 
  nodes.pop()
    nodes.unshift(newNode)
    moveEnd()
}

function startGame() {
  if (isGameOver) {
    direction = 'right'
    createSnake()
    createFood()
    score = 0
    isGameOver = false
  }
  timer = setInterval(move,300)
}
    
Page({
  data:{
    btnTitle:'开始'
  },
  onLoad:function(){
    that = this
    createSnake()
    createFood()
    draw()
  },
  changeDirection:function(e){
    if ('开始' == this.data.btnTitle) return
    var title = e.target.id
    if (title == 'down' || title == 'up') {
        if (direction == 'up' || direction == 'down') return
    } else if (direction == 'left' || direction == 'right') return
    direction = title;
  },
  startGame:function() {
    var title = this.data.btnTitle
    if (title == '暂停') {
      clearInterval(timer)
      this.setData({
        btnTitle : '开始'
      })
    } else {
      startGame()
      this.setData({
        btnTitle : '暂停'
      })
    }
  }
})