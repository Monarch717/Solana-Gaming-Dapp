import SnakeHeader from "./components/SnakeHeader/SnakeHeader"
import ScoreBoard from "./components/ScoreBoard/ScoreBoard"
import GameBoard from "./components/GameBoard/GameBoard"
import {Body, Snake} from "./classes/LinkedList"
import {TurningPoint} from "./classes/Queue"
import Swipe from "react-easy-swipe"

import React, {useCallback, useEffect, useState} from "react"

import "./game.css"
import "./utils.css"

let Settings = {
  foodClasses: [
    "blueberry",
    "cherry",
    "grapes",
    "raspberry",
    "strawberry"
  ],
  boardWidth: 20,
  boardHeight: 15,
  allowSwipe: true,
  eatAudio: new Audio(
    "https://github.com/diozz/snake-react-js/raw/main/src/sounds/eat.mp3"
  ),
  gameOverAudio: new Audio(
    "https://github.com/diozz/snake-react-js/raw/main/src/sounds/game-over.mp3"
  )
}

const Game = () => {
  // states
  const [currentScore, setCurrentScore] = useState(0)
  const [bestScore, setBestScore] = useState("--")
  const [gameOverMsg, setGameOverMsg] = useState("")
  const [snake, setSnake] = useState(null)

  const [foodCoordinate, setFoodCoordinate] = useState([8, 18])
  const [foodClass, setFoodClass] = useState("")
  const [gameOverDisplay, setGameOverDisplay] = useState(false)
  const [gameMenuDisplay, setGameMenuDisplay] = useState(true)
  const [intervalId, setIntervalId] = useState(undefined)
  const [mode, setMode] = useState('hard')
  const [snakeDelay, setSnakeDelay] = useState(100)
  const [turningPoints, setTurningPoints] = useState([])

  const init = () => {
    setCurrentScore(0)
    setBestScore("--")
    setGameOverMsg("")
    setFoodCoordinate([8, 18])
    setFoodClass(Settings.foodClasses[getRandomInt(0, Settings.foodClasses.length - 1)])
    setGameOverDisplay(false)
    setGameMenuDisplay(true)
    // setTurningPoints([])

    let _snake = new Snake()

    _snake.add(new Body([1, 3], "R"))
    _snake.add(new Body([1, 2], "R"))
    _snake.add(new Body([1, 1], "R"))

    setSnake(_snake)

    if (intervalId !== undefined)
      clearInterval(intervalId)
    setIntervalId(undefined)
  }

  useEffect(() => {
    Settings.eatAudio.load()
    Settings.gameOverAudio.load()
    init()
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", keyListener, false)

    if (!gameOverDisplay && !gameMenuDisplay) {
      updateSnakeState()
    }
    
    return () => {
      document.removeEventListener("keydown", keyListener, false)
    }
  }, [gameOverDisplay, gameMenuDisplay])

  const keyListener = (event) => {
    console.log('keydown', event.keyCode, gameMenuDisplay, gameOverDisplay)
    if (gameMenuDisplay || gameOverDisplay) return

    let keyCode = event.keyCode
    let tempSnake = snake.copy()


    let turningPoint = new TurningPoint(null, null)
    let _turningPoints = turningPoints.slice(0)

    switch (keyCode) {
      case 38:
        if (
          tempSnake.head.direction === "T" ||
          tempSnake.head.direction === "B"
        )
          return

        turningPoint.nextDirection = "T"
        turningPoint.coordinates = [...tempSnake.head.coordinates]
        _turningPoints.push(turningPoint)

        break

      case 39:
        if (
          tempSnake.head.direction === "R" ||
          tempSnake.head.direction === "L"
        )
          return

        turningPoint.nextDirection = "R"
        turningPoint.coordinates = [...tempSnake.head.coordinates]
        _turningPoints.push(turningPoint)

        break

      case 40:
        if (
          tempSnake.head.direction === "B" ||
          tempSnake.head.direction === "T"
        )
          return

        turningPoint.nextDirection = "B"
        turningPoint.coordinates = [...tempSnake.head.coordinates]
        _turningPoints.push(turningPoint)

        break

      case 37:
        if (
          tempSnake.head.direction === "L" ||
          tempSnake.head.direction === "R"
        )
          return

        turningPoint.nextDirection = "L"
        turningPoint.coordinates = [...tempSnake.head.coordinates]
        _turningPoints.push(turningPoint)
        break

      default:
        break
    }
    setSnake(tempSnake)
    setTurningPoints(_turningPoints)
  }

  const updateSnakeState = () => {
    console.log('update-state', gameMenuDisplay, gameOverDisplay)
    if (gameMenuDisplay || gameOverDisplay) return

    let tempSnake = snake.copy()

    let currentBodyPiece = tempSnake.head

    if (tempSnake.isOn(currentBodyPiece.coordinates, true)) {
      gameOver()
      return
    }

    //gameOverDetection
    switch (currentBodyPiece.direction) {
      case "T":
        if (currentBodyPiece.coordinates[0] < 0) {
          gameOver()
          return
        }
        break

      case "R":
        if (currentBodyPiece.coordinates[1] > Settings.boardWidth - 1) {
          gameOver()
          return
        }
        break

      case "B":
        if (currentBodyPiece.coordinates[0] > Settings.boardHeight - 1) {
          gameOver()
          return
        }
        break

      case "L":
        if (currentBodyPiece.coordinates[1] < 0) {
          gameOver()
          return
        }
        break

      default:
        break
    }

    //updateSnakePosition
    while (currentBodyPiece) {
      if (
        turningPoints.some(
          (x) =>
            x.coordinates[0] === currentBodyPiece.coordinates[0] &&
            x.coordinates[1] === currentBodyPiece.coordinates[1]
        )
      ) {
        currentBodyPiece.direction = turningPoints.filter(
          (x) =>
            x.coordinates[0] === currentBodyPiece.coordinates[0] &&
            x.coordinates[1] === currentBodyPiece.coordinates[1]
        )[0].nextDirection

        if (currentBodyPiece.tail) {
          let _turningPoints = turningPoints.slice(0)
          _turningPoints.shift()
          setTurningPoints(_turningPoints)
        }
      }

      switch (currentBodyPiece.direction) {
        case "T":
          currentBodyPiece.coordinates[0]--
          break

        case "R":
          currentBodyPiece.coordinates[1]++
          break

        case "B":
          currentBodyPiece.coordinates[0]++
          break

        case "L":
          currentBodyPiece.coordinates[1]--
          break

        default:
          break
      }

      currentBodyPiece = currentBodyPiece.next
    }

    //Ate.
    if (
      tempSnake.head.coordinates[0] === foodCoordinate[0] &&
      tempSnake.head.coordinates[1] === foodCoordinate[1]
    ) {
      let newScore = currentScore + 5
      let newFoodX = 0
      let newFoodY = 0

      while (true) {
        newFoodY = getRandomInt(0, Settings.boardHeight - 1)
        newFoodX = getRandomInt(0, Settings.boardWidth - 1)

        if (
          newFoodY === Settings.foodCoordinate[0] &&
          newFoodX === Settings.foodCoordinate[1]
        )
          continue

        if (tempSnake.isOn([newFoodY, newFoodX])) continue

        break
      }

      tempSnake.eat()
      Settings.eatAudio.play()

      setSnake(tempSnake)
      setCurrentScore(newScore)
      setFoodCoordinate([newFoodY, newFoodX])
      setFoodClass(Settings.foodClasses[getRandomInt(0, Settings.foodClasses.length - 1)])

    } else {
      setSnake(tempSnake)
    }
    setTimeout(updateSnakeState, snakeDelay)
  }

  const startGame = (_delay) => {
    switch (_delay) {
      case 75:
        setMode('hard')
        break
      case 120:
        setMode('medium')
        break
      case 200:
        setMode('easy')
        break
    }

    setSnakeDelay(_delay)
    setGameMenuDisplay(false)
    setGameOverDisplay(false)
    setBestScore(getBestScore(mode))
  }
  console.log('test', gameMenuDisplay, gameOverDisplay)

  const endGame = () => {
    init()
  }

  const gameOver = () => {
    Settings.gameOverAudio.play()

    if (intervalId !== undefined)
      clearInterval(intervalId)
    let _gameOverMsg = 'GAME OVER!'
    let _bestScore = getBestScore(mode)
    if (currentScore > _bestScore) {
      localStorage.setItem(mode + "BestScore", currentScore.toString())
      _bestScore = currentScore
      _gameOverMsg = "NEW BEST!"
    }

    setGameOverDisplay(true)
    setBestScore(_bestScore)
    setGameOverMsg(_gameOverMsg)
    // setTurningPoints([])
    console.log('gameover', _gameOverMsg)
  }

  const getBestScore = (mode) => {
    let _bestScore = localStorage.getItem(mode + "BestScore")
    _bestScore = _bestScore === null ? 0 : parseInt(_bestScore)
    return _bestScore
  }

  const getRandomInt = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const onSwipeMove = (position, event) => {
    if (gameMenuDisplay || gameOverDisplay) return

    let tolerance = 2
    let x = position.x
    let y = position.y

    if (Settings.allowSwipe) {
      if (Math.abs(x) > tolerance || Math.abs(y) > tolerance) {
        Settings.allowSwipe = false
        if (Math.abs(y) > Math.abs(x))
          keyListener({keyCode: y > 0 ? 40 : 38})
        else
          keyListener({keyCode: x > 0 ? 39 : 37})
      }
    }
  }


  return (
    <div
      className="app-bg"
      onTouchStart={() => {
        Settings.allowSwipe = true
      }}
    >
      <Swipe
        className="full-height flex flex-center"
        onSwipeMove={onSwipeMove}
      >
        <div className="container">
          <div className="flex">
            <div className="titleContainer">
              <div className="border">
                <SnakeHeader/>
              </div>
            </div>
            <div className="scoreContainer">
              <div className="border">
                <ScoreBoard
                  bestScore={bestScore}
                  currentScore={currentScore}
                />
              </div>
            </div>
          </div>

          <div className="border mt-2">
            {snake && <GameBoard
              getRandomInt={getRandomInt}
              boardWidth={Settings.boardWidth}
              boardHeight={Settings.boardHeight}
              snake={snake}
              currentScore={currentScore}
              foodCoordinate={foodCoordinate}
              foodClass={foodClass}
              gameOverDisplay={gameOverDisplay}
            />}
          </div>

          {gameMenuDisplay && (
            <div className="border menu-overlay mt-2">
              <div className="flex flex-center">
                <div className="snake-food snake menu-food mr-4"></div>
                <div className="game-over-text">MENU</div>
                <div className="snake-food snake invert menu-food ml-4"></div>
              </div>
              <div className="flex mt-2">
                <span
                  onClick={() => startGame(200)}
                  className="snakeButton mr-1"
                >
                  EASY
                </span>
                <span
                  onClick={() => startGame(120)}
                  className="snakeButton mr-1 ml-1"
                >
                  MEDIUM
                </span>
                <span
                  onClick={() => startGame(75)}
                  className="snakeButton ml-1"
                >
                  HARD
                </span>
              </div>
            </div>
          )}

          {gameOverDisplay && (
            <div className="border gameover-overlay mt-2">
              <div className="game-over-text">
                {gameOverMsg}
              </div>
              <div className="flex mt-2">
                <span
                  onClick={() => endGame()}
                  className="snakeButton mr-1 ml-1"
                >
                  RESTART
                </span>
              </div>
            </div>
          )}
        </div>
      </Swipe>
    </div>
  )
}

export default Game
