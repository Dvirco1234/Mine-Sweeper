'use strict'

function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
  }

  function getRandomIntInc(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  