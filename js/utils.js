'use strict'

  function getRandomIntInc(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  function makeNegsEmpty(rowIdx, colIdx) {
    //Make shure always first click and one of it`s negs empty
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            gBoard[i][j].isEmpty = true
            console.log(gBoard[i][j]);
        }
    }
}

function hideShown(rowIdx, colIdx){
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue
      
      for (var j = colIdx - 1; j <= colIdx + 1; j++) {
          if (j < 0 || j >= gBoard[i].length) continue
          if (i === rowIdx && j === colIdx) continue
          
          var elCell = document.querySelector(`.cell-${i}-${j}`)
          if (gBoard[i][j].isShown){
              elCell.classList.remove('clicked')
              gBoard[i][j].isShown = false
              gGame.shownCount-- // Update number of clicked cell

              if(gBoard[i][j].minesAroundCount) elCell.querySelector('span').hidden = true
              if(gBoard[i][j].minesAroundCount === 0) hideShown(i, j)
          } else continue
          
      }
  }
  
}


// function makeModern(elBtn){
//     gGame.isModern = !gGame.isModern
    
//     if(gGame.isModern){
//         elBtn.innerText = 'Vintage'
//         document.querySelector('.con').innerHTML = '<link rel="stylesheet" href="css/modern.css">'
//     } else {
//         elBtn.innerText = 'Modern'
//         document.querySelector('.con').innerHTML = ''
//     }
    
// }

// if(j < 0){
//   gBoard[i][j + 3].isEmpty = true
//   continue
// } else if(j >= gBoard[0].length){
//   gBoard[i][j - 3].isEmpty = true
//   continue
// } else if(i >= gBoard.length){
//   gBoard[i - 3][j].isEmpty = true
//   continue
// } else if(i < 0){
//   gBoard[i + 3][j].isEmpty = true
//   continue
// }// else if (i === rowIdx && j === colIdx) gBoard[i + 2][j].isEmpty = true


// gGame.isOn = false
// gGame.isGameOver = false
// gGame.isWin = false
// gGame.lives = ['❤ ', '❤ ', '❤ ']
// gGame.shownCount = 0
// gGame.markedCount = 0
  