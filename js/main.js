'use strict'

const MINE = '💥'
const FLAG = '🚩'
const EMPTY = ''
const SMILEY = '😊'
const SAD = '😭'
const WINNER = '😎'

var gBoard
var gGame = { 
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0 
}
var gLevel = {
    size: 4,
    mines: 2,
}
var gTimer = {
    isOn: false,
    startTimer: 0,
    countMinutes: 0,
}

function initGame(){
    createButtons()
    gBoard = buildEmptyBoard(gLevel.size)
    renderBoard(gBoard)
    var elBtn = document.querySelector(`.btn4`)
    elBtn.classList.add('selected-btn')
}

function startGame(){
    gGame.isOn = true
    addRandMines()
    buildBoard()
    renderBoard(gBoard)
    gTimer.startTimer = setInterval(timer, 57)
}

function buildEmptyBoard(size){
    var board = []

    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                firstClick: {}
            }
        }
    }
    console.log('board:', board)
    return board;
}

function addRandMines(){
    var minesCount = gLevel.mines

    while (minesCount) { // if not all mines added, start again
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                if(gBoard[i][j].firstClick.i === i && gBoard[i][j].firstClick.j === j) continue // the first click can't be mine
                if(minesCount){
                    if(getRandomIntInc(1, gLevel.size) === 1 && !gBoard[i][j].isMine){
                        gBoard[i][j].isMine = true
                        gBoard[i][j].minesAroundCount = MINE
                        minesCount--
                        // console.log('done')
                    } 
                } else break
            }
        }
        // console.log('again:', minesCount)
    }
        return gBoard;
}

function buildBoard(){

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if(gBoard[i][j].isMine) continue
            else gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j)
        }
    }
    return gBoard;
}

function renderBoard(board){
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j].minesAroundCount
            var className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className} num${cell}`
            if(gBoard[i][j].isMine) strHTML += ` mine`
            strHTML += `" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="rightClick(event, this, ${i}, ${j})"><span >${cell}</span><span class="flag"></span></td>` //hidden span for content, and flag span to add or remove flag.
        }
        strHTML += '</tr>'
    }
    var elBoard = document.querySelector('tbody')
    elBoard.innerHTML = strHTML
}

function setMinesNegsCount(rowIdx, colIdx){
    var count = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue

            if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isMine) count++
        }
    }
    return count
}
function cellClicked(elCell, i, j){
    if(gBoard[i][j].isMarked) return
    if(!gGame.isOn){       
        gBoard[i][j].firstClick = {i, j}
        startGame()
    }
    if(gBoard[i][j].isMine)
    // cellMarked(elCell, i, j)
    console.log(i, j)
    // elCell.addEventListener('contextmenu', (ev)=>{console.log('ev.button:', ev.button)})
    elCell.classList.add('clicked')
    gBoard[i][j].isShown = true
    if(gBoard[i][j].minesAroundCount) elCell.querySelector('span').hidden = false // show cell content only if !== 0
}
function cellMarked(elCell, i, j){
}

function rightClick(clickEvent, elCell, i, j) {
    clickEvent.preventDefault()
    // if()
    if(!gBoard[i][j].isMarked){
        gBoard[i][j].isMarked = true
        elCell.querySelector('.flag').innerText = FLAG
        elCell.classList.add('marked')
        // if(gBoard[i][j].isMine) gGame.markedCount++
        gGame.markedCount++
        document.querySelector('.box-count span').innerText = gGame.markedCount
    } else {
        gBoard[i][j].isMarked = false
        elCell.querySelector('.flag').innerText = ''
        elCell.classList.remove('marked')
        // if(gBoard[i][j].isMine) gGame.markedCount--
        gGame.markedCount--
        document.querySelector('.box-count span').innerText = gGame.markedCount
    }
    console.log('gGame.markedCount:', gGame.markedCount)
    // gBoard[i][j].minesAroundCount = 123
    // return false;
}

function checkGameOver(){
    
}

function expandShown(board, elCell, i, j){

}

function createButtons(){
    var strHTML = 'Chose Your Level:<br>Beginner'
    var boardSize = 4
    for(var i = 0; i < 3; i++){
        strHTML += `(${boardSize}x${boardSize})<button class="btn btn${boardSize}" onclick="choseLevel(this, ${boardSize})"></button>`
        boardSize += 4
        if(boardSize === 8) strHTML += ' Medium'
        if(boardSize === 12) strHTML += ' Expert'
    }
    var elBtns = document.querySelector('.box-button')
    elBtns.innerHTML = strHTML
}

function choseLevel(elBtn, size){
    createButtons()
    var elBtn = document.querySelector(`.btn${size}`)
    elBtn.classList.add('selected-btn')
    gLevel.size = size
    if(size === 4) gLevel.mines = 2
    else if(size === 8) gLevel.mines = 12
    else gLevel.mines = 30
    gBoard = buildEmptyBoard(size)
    renderBoard(gBoard)
    gGame.isOn = false  
}

// function startTimer(){
//     gTimer = setInterval(timer, 57)
// }


// function timer(){
//     var elTime = document.querySelector(`.box-time span`)
//     var now = new Date()
//     var seconds = Math.floor((now - gTimer.startTimer) / 1000)
//     var milliseconds = (now - gTimer.startTimer) % 1000
    
//     if(seconds > 59){
//         gTimer.startTimer = new Date()
//         gTimer.countMinutes++
//     } 
//     if(seconds > 9) elTime.innerText = `0${gTimer.countMinutes}:${seconds}:${milliseconds}`
//     else elTime.innerText = `0${gTimer.countMinutes}:0${seconds}:${milliseconds}`
    
// }

