'use strict'

const MINE = '💥'
const FLAG = '🚩'
const EMPTY = ''
const SMILEY = '😊'
const SAD = '😭'
const WINNER = '😎'
const HINT = '💡'

var gBoard
var gGame = {
    isModern: false,
}

var gLevel = {
    size: 4,
    mines: 2,
    minesCounter: 0,
}
var gTimer = {
    timerOn: 0,
    startTimer: 0,
    countMinutes: 0,
}

function initGame(){
    clearInterval(gTimer.timerOn)
    document.querySelector(`.box-time span`).innerText = '00:00'

    document.querySelector('.emoji').innerText = SMILEY
    gGame = { 
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        safeClicks: 3,
        secsPassed: 0,
        lives: ['❤ ', '❤ ', '❤ '],
        isHint: false,
        isWin: false,
        isGameOver: false,
        isManual: false,
        allMoves: [],
        isSevenBoom: false,
    }
    gLevel.minesCounter = gLevel.mines // for manually locate mines
    
    var lives = gGame.lives.join('')
    document.querySelector('.lives span').innerText = lives
    
    //safe click button
    document.querySelector('.safe-btn span').innerText = `${gGame.safeClicks} Clicks available`
    
    renderHints()
    createLevelButtons()
    gBoard = buildEmptyBoard(gLevel.size)
    renderBoard(gBoard)

    var elBtn = document.querySelector(`.btn${gLevel.size}`)
    elBtn.classList.add('selected-btn')
    // reset mines count
    document.querySelector('.box-count span').innerText = gLevel.mines
    //update the manually locate button
    document.querySelector('.manual-pos').innerText = 'Manually Locate Mines'
    document.querySelector('.manual-pos').classList.remove('manual-pos-clicked')
    document.querySelector('.manual-pos-btn span').innerText = `${gLevel.mines} Mines Left`

    // document.querySelector('.best-score').innerText = `Best Score ${gLevel.size}x${gLevel.size}: `
}

function startGame(i, j){
    gGame.isOn = true
    // only if the counter !== 0- it meens no manual locations
    // or if 7 boom
    if(gLevel.minesCounter && !gGame.isSevenBoom) addRandMines(i, j) 

    buildBoard()
    renderBoard(gBoard)
    
    gTimer.countMinutes = 0
    gTimer.startTimer = new Date()
    gTimer.timerOn = setInterval(timer, 1000)
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
                isEmpty: false
                // firstClick: {},
            }
        }
    }
    // console.log('board:', board)
    return board;
}

function addRandMines(rowIdx, colIdx){
    var minesCount = gLevel.mines

    while (minesCount) { // if not all mines added, start again
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                // if(gBoard[i][j].firstClick.i === i && gBoard[i][j].firstClick.j === j) continue // the first click can't be mine
                // if(i === rowIdx && j === colIdx) continue
                if(gBoard[i][j].isEmpty) continue
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
            strHTML += `<td class="${className} nums num${cell}`
            if(gBoard[i][j].isMine) strHTML += ` mine`
            strHTML += `" onclick="cellClicked(this, ${i}, ${j});manuallyLocateMines(this, ${i}, ${j});" oncontextmenu="rightClick(event, this, ${i}, ${j})"><span hidden>${cell}</span><span class="flag"></span></td>` //hidden span for content, and flag span to add or remove flag.
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

    if(gBoard[i][j].isShown || gBoard[i][j].isMarked) return
    if(gGame.isGameOver || gGame.isWin) return
    if(gGame.isManual) return

    if(!gGame.isOn){       
        makeNegsEmpty(i, j) //When first clicking, cell must be empty
        startGame(i, j)

        // debuging first click without recursion
        document.querySelector(`.cell-${i}-${j}`).classList.add('clicked') // debugged
        gBoard[i][j].isShown = true
        gGame.shownCount++
        if(gBoard[i][j].minesAroundCount) document.querySelector(`.cell-${i}-${j} span`).hidden = false // debugged
        gGame.allMoves.push({i, j, elCell, })
        expandShown(i, j)
        return
        // debuging first click without recursion
    }
    if(gGame.isHint){
        stopHint(elCell, i, j)
        return
    } 
    if(gBoard[i][j].minesAroundCount === 0){
        expandShown(i, j)
        gGame.shownCount--
    } 
    if(gBoard[i][j].isMine) {
        checkGameOver(elCell)
        return
    }
    // elCell.classList.add('clicked')
    document.querySelector(`.cell-${i}-${j}`).classList.add('clicked') // debugged
    gBoard[i][j].isShown = true
    gGame.shownCount++ // Update number of clicked cell

    // remember last turn
    gGame.allMoves.push({i, j, elCell, })
    console.log(gGame.shownCount);

    // show cell content only if !== 0
    if(gBoard[i][j].minesAroundCount) document.querySelector(`.cell-${i}-${j} span`).hidden = false // debugged
    // if(gBoard[i][j].minesAroundCount) elCell.querySelector('span').hidden = false 
    checkWin()
}

function rightClick(clickEvent, elCell, i, j) {
    clickEvent.preventDefault()
    if(gGame.isGameOver || gGame.isWin) return
    if(gBoard[i][j].isShown) return

    if(!gBoard[i][j].isMarked){
        if(gLevel.mines === gGame.markedCount) return //Can`t mark more than the number of mines
        gBoard[i][j].isMarked = true
        elCell.querySelector('.flag').innerText = FLAG
        elCell.classList.add('marked')
        gGame.markedCount++
        document.querySelector('.box-count span').innerText = gLevel.mines - gGame.markedCount
    } else {
        gBoard[i][j].isMarked = false
        elCell.querySelector('.flag').innerText = ''
        elCell.classList.remove('marked')
        gGame.markedCount--
        document.querySelector('.box-count span').innerText = gLevel.mines - gGame.markedCount
    }
    console.log('gGame.markedCount:', gGame.markedCount)
    checkWin()
}

function expandShown(rowIdx, colIdx){
    
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isMine) continue
            
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if (!gBoard[i][j].isShown){
                elCell.classList.add('clicked')
                gBoard[i][j].isShown = true
                gGame.shownCount++ // Update number of clicked cell
                // console.log('count:' ,gGame.shownCount);

                if(gBoard[i][j].minesAroundCount) elCell.querySelector('span').hidden = false
                if(gBoard[i][j].minesAroundCount === 0) expandShown(i, j)
            } else continue
            
        }
    }
    
}

function undo(){
    var lastMove = gGame.allMoves.pop()
    var i = lastMove.i
    var j = lastMove.j

    if(gBoard[i][j].minesAroundCount === 0){
        hideShown(i, j)
        // gGame.shownCount--
    }

    document.querySelector(`.cell-${i}-${j}`).classList.remove('clicked')
    gBoard[i][j].isShown = false
    // gGame.shownCount--

    if(gBoard[i][j].minesAroundCount) document.querySelector(`.cell-${i}-${j} span`).hidden = true
}

function checkBestScore(){
    var currScore = gGame.secsPassed



    if(!localStorage[`bestScore${gLevel.size}`]) localStorage.setItem(`bestScore${gLevel.size}`, currScore)

    if (currScore < localStorage[`bestScore${gLevel.size}`]) localStorage[`bestScore${gLevel.size}`] = currScore
    
    document.querySelector('.best-score span').innerText = localStorage.getItem(`bestScore${gLevel.size}`) + ' Seconds!'
}

function checkWin(){
    var allCellsWithoutMine = gBoard.length ** 2 - gLevel.mines
    if(gGame.markedCount === gLevel.mines && gGame.shownCount === allCellsWithoutMine){ // if all the flags in place -and- all cells shown
        gGame.isWin = true
        console.log(gGame.isWin)
        gameOver()
        checkBestScore()
    }
}

function checkGameOver(elCell){

    if(gGame.lives.length === 1){
        elCell.style.background = 'rgb(163, 31, 31)'
        gameOver()
    } else {
        gGame.lives.pop()
        var lives = gGame.lives.join('')
        document.querySelector('.lives span').innerText = lives

        var mineModal = document.querySelector('.mine-modal')
        mineModal.style.display = 'block'
        setTimeout(()=>{mineModal.style.display = 'none'}, 400)
    }
}

function gameOver(){
    gGame.isGameOver = true
    clearInterval(gTimer.timerOn)

    if(gGame.isWin){
        document.querySelector('.emoji').innerText = WINNER
    } else {
        document.querySelector('.lives span').innerText = ' '
        document.querySelector('.emoji').innerText = SAD
        console.log('game over');
        for(var i = 0; i < gBoard.length; i++){
            for(var j = 0; j < gBoard.length; j++){
                if(gBoard[i][j].isMine){
                    if(gBoard[i][j].isMarked) continue
                    else document.querySelector(`.cell-${i}-${j} span`).hidden = false
                } 
            }
        }
    }

}

function renderHints(){
    var strHTML = 'Hints: '
    for(var i = 0; i < 3; i++){
        strHTML += `<div class="hint hint${i + 1}" onclick="giveHint(this)"> 💡 </div>`
    }
    document.querySelector('.hints').innerHTML = strHTML
}

function giveHint(elHint){
    if(!gGame.isOn || gGame.isGameOver || gGame.isWin) return
    gGame.isHint = true
    elHint.style.display = 'none'
}

function stopHint(elCell, i, j){
    gGame.isHint = false
    if(gBoard[i][j].minesAroundCount) {
        elCell.querySelector('span').hidden = false
        setTimeout(() => {
            elCell.querySelector('span').hidden = true
        }, 1000)
    }
}

function safeClick(){
    if(gGame.safeClicks === 0 || !gGame.isOn) return

    var allCellsWithoutMine = gBoard.length ** 2 - gLevel.mines
    if(gGame.shownCount === allCellsWithoutMine) return

    gGame.safeClicks--
    
    document.querySelector('.safe-btn span').innerText = `${gGame.safeClicks} Clicks available`
    
    var isFound = false
    while (!isFound) {
        var i = getRandomIntInc(0, gBoard.length - 1)
        var j = getRandomIntInc(0, gBoard[0].length - 1)

        if(gBoard[i][j].isMarked || gBoard[i][j].isShown || gBoard[i][j].isMine || gBoard[i][j].minesAroundCount === 0) continue

        var cell = document.querySelector(`.cell-${i}-${j}`) 
        cell.classList.add('safe-cell')
        
        isFound = true
        // console.log('isFound:', isFound)
        setTimeout(() =>{
            cell.classList.remove('safe-cell')
        } ,1500)
    }
}

function toggleManuallyPositionMines(elBtn){
    if(gGame.isOn) return
    if(gGame.isManual && gLevel.minesCounter) return // you have to locate all mines before you can start
    if(gGame.isManual) elBtn.innerText = 'Start playing!!!'
    gGame.isManual = !gGame.isManual
    elBtn.classList.toggle('manual-pos-clicked')
}

function manuallyLocateMines(elCell, i, j){
    // if you press after game started nothing happens, and also if the manual button unpressed
    // or all mines set
    if(gGame.isOn) return
    if(!gGame.isManual || gLevel.minesCounter === 0) return
    if(gBoard[i][j].isMine) return // locate only one at the cell

    gBoard[i][j].minesAroundCount = MINE
    gBoard[i][j].isMine = true

    elCell.querySelector('span').innerText = MINE
    gLevel.minesCounter--
    // update the number of mines left
    document.querySelector('.manual-pos-btn span').innerText = `${gLevel.minesCounter} Mines Left`
    if(gLevel.minesCounter === 0) document.querySelector('.manual-pos').innerText = 'All set! Press to begin'
}

function sevenBoom(){
    if(gGame.isOn) return
    initGame()
    gGame.isSevenBoom = true
    var count = 0
    var minesCount = 0
    for(var i = 0; i < gBoard.length; i++){
        for(var j = 0; j < gBoard[0].length; j++){
            count++
            if(i === 0 && j === 0) continue
            if(count % 7 === 0 || (count - 7) % 10 === 0) {
                gBoard[i][j].isMine = true
                gBoard[i][j].minesAroundCount = MINE
                minesCount++
            }
        }
    }
    gLevel.mines = minesCount
    document.querySelector('.box-count span').innerText = gLevel.mines
    startGame()
}

function createLevelButtons(){
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
    if(gGame.isOn) return
    createLevelButtons()
    var elBtn = document.querySelector(`.btn${size}`)
    elBtn.classList.add('selected-btn')
    gLevel.size = size
    if(size === 4) gLevel.mines = 2
    else if(size === 8) gLevel.mines = 12
    else gLevel.mines = 30

    // //Best score
    // document.querySelector('.best-score').innerText = `Best Score ${gLevel.size}x${gLevel.size}: `
    //for manually locate mines
    gLevel.minesCounter = gLevel.mines 
    document.querySelector('.manual-pos-btn span').innerText = `${gLevel.mines} Mines Left`

    document.querySelector('.box-count span').innerText = gLevel.mines
    gBoard = buildEmptyBoard(size)
    renderBoard(gBoard)
    gGame.isOn = false  
}

function timer(){
    var elTime = document.querySelector(`.box-time span`)
    // var now = new Date()
    var seconds = Math.floor((new Date() - gTimer.startTimer) / 1000)
    
    gGame.secsPassed++
    // console.log('gGame.secsPassed:', gGame.secsPassed)
    if(seconds > 59){
        gTimer.startTimer = new Date()
        gTimer.countMinutes++
    } 
    if(seconds > 9) elTime.innerText = `0${gTimer.countMinutes}:${seconds}`
    else elTime.innerText = `0${gTimer.countMinutes}:0${seconds}`  
}

function makeModern(elBtn){
    gGame.isModern = !gGame.isModern
    
    if(gGame.isModern){
        elBtn.innerText = 'Vintage'
        document.querySelector('.container').innerHTML = '<link rel="stylesheet" href="css/modern.css">'
    } else {
        elBtn.innerText = 'Modern'
        document.querySelector('.container').innerHTML = ''
    }
    
}

