import SnakeHeader from "./components/SnakeHeader/SnakeHeader"
import ScoreBoard from "./components/ScoreBoard/ScoreBoard"
import GameBoard from "./components/GameBoard/GameBoard"
import {Body, Snake} from "./classes/LinkedList"
import {TurningPoint} from "./classes/Queue"
import Swipe from "react-easy-swipe"
import FBDB from "../../service/firebase"

import React, {Component, useEffect, useState} from "react"

import "./game.css"
import "./utils.css"
import {useDispatch, useSelector} from "react-redux"
import {useNavigate} from "react-router-dom"
import {setCanPlay} from "../../slices/app"
import Container from "../../components/Container"

class Game extends Component {
  constructor() {
    super()

    this.foodClasses = [
      "blueberry",
      "cherry",
      "grapes",
      "raspberry"
    ]
    this.turningPoints = []
    this.boardWidth = 20
    this.boardHeight = 15
    this.snakeDelay = 100
    this.allowSwipe = true
    this.mode = 'easy'

    this.eatAudio = new Audio(
      "https://github.com/diozz/snake-react-js/raw/main/src/sounds/eat.mp3"
    )
    this.gameOverAudio = new Audio(
      "https://github.com/diozz/snake-react-js/raw/main/src/sounds/game-over.mp3"
    )

    let snake = new Snake()

    snake.add(new Body([1, 3], "R"))
    snake.add(new Body([1, 2], "R"))
    snake.add(new Body([1, 1], "R"))

    this.state = {
      currentScore: 0,
      bestScore: '--',
      gameOverMsg: "",
      snake: snake,
      foodCoordinate: [8, 18],
      foodClass: this.foodClasses[
        this.getRandomInt(0, this.foodClasses.length - 1)
        ],
      gameOverDisplay: false,
      gameMenuDisplay: true
    }

    this.updateSnakeState = this.updateSnakeState.bind(this)
    this.onSwipeMove = this.onSwipeMove.bind(this)
    this.keyListner = this.keyListner.bind(this)
    this.startGame = this.startGame.bind(this)
    this.gameOver = this.gameOver.bind(this)
    this.endGame = this.endGame.bind(this)
  }

  componentDidMount() {
    this.eatAudio.load()
    this.gameOverAudio.load()

    document.addEventListener("keydown", this.keyListner, false)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyListner, false)
  }

  keyListner(event) {
    if (this.state.gameMenuDisplay || this.state.gameOverDisplay) return

    let keyCode = event.keyCode
    let tempSnake = this.state.snake

    let turningPoint = new TurningPoint(null, null)

    switch (keyCode) {
      case 38:
        if (
          tempSnake.head.direction === "T" ||
          tempSnake.head.direction === "B"
        )
          return

        turningPoint.nextDirection = "T"
        turningPoint.coordinates = [...tempSnake.head.coordinates]
        this.turningPoints.push(turningPoint)

        this.setState({snake: tempSnake})
        break

      case 39:
        if (
          tempSnake.head.direction === "R" ||
          tempSnake.head.direction === "L"
        )
          return

        turningPoint.nextDirection = "R"
        turningPoint.coordinates = [...tempSnake.head.coordinates]
        this.turningPoints.push(turningPoint)

        this.setState({snake: tempSnake})
        break

      case 40:
        if (
          tempSnake.head.direction === "B" ||
          tempSnake.head.direction === "T"
        )
          return

        turningPoint.nextDirection = "B"
        turningPoint.coordinates = [...tempSnake.head.coordinates]
        this.turningPoints.push(turningPoint)

        this.setState({snake: tempSnake})
        break

      case 37:
        if (
          tempSnake.head.direction === "L" ||
          tempSnake.head.direction === "R"
        )
          return

        turningPoint.nextDirection = "L"
        turningPoint.coordinates = [...tempSnake.head.coordinates]
        this.turningPoints.push(turningPoint)

        this.setState({snake: tempSnake})
        break

      default:
        break
    }
  }

  startGame(snakeDelay) {
    if (!this.props.canPlay) {
      this.props.navigate('/')
      return
    }

    switch (snakeDelay) {
      case 75:
        this.mode = 'hard'
        break
      case 120:
        this.mode = 'medium'
        break
      case 200:
        this.mode = 'easy'
        break
    }

    this.snakeDelay = snakeDelay
    this.setState({gameMenuDisplay: false, gameOverDisplay: false, bestScore: this.getBestScore(this.mode)})

    this.intervalId = window.setInterval(
      this.updateSnakeState,
      this.snakeDelay
    )
  }

  endGame() {
    if (!this.props.canPlay) {
      this.props.navigate('/')
      return
    }

    let snake = new Snake()

    snake.add(new Body([1, 3], "R"))
    snake.add(new Body([1, 2], "R"))
    snake.add(new Body([1, 1], "R"))

    this.setState({
      currentScore: 0,
      snake: snake,
      bestScore: '--',
      foodCoordinate: [8, 18],
      foodClass: this.foodClasses[
        this.getRandomInt(0, this.foodClasses.length - 1)
        ],
      gameOverDisplay: false,
      gameMenuDisplay: true
    })
  }

  updateSnakeState() {
    let tempSnake = this.state.snake
    let currentBodyPiece = tempSnake.head

    if (tempSnake.isOn(currentBodyPiece.coordinates, true)) {
      this.gameOver()
      return
    }

    //gameOverDetection
    switch (currentBodyPiece.direction) {
      case "T":
        if (currentBodyPiece.coordinates[0] < 0) {
          this.gameOver()
          return
        }
        break

      case "R":
        if (currentBodyPiece.coordinates[1] > this.boardWidth - 1) {
          this.gameOver()
          return
        }
        break

      case "B":
        if (currentBodyPiece.coordinates[0] > this.boardHeight - 1) {
          this.gameOver()
          return
        }
        break

      case "L":
        if (currentBodyPiece.coordinates[1] < 0) {
          this.gameOver()
          return
        }
        break

      default:
        break
    }

    //updateSnakePosition
    while (currentBodyPiece) {
      if (
        this.turningPoints.some(
          (x) =>
            x.coordinates[0] === currentBodyPiece.coordinates[0] &&
            x.coordinates[1] === currentBodyPiece.coordinates[1]
        )
      ) {
        currentBodyPiece.direction = this.turningPoints.filter(
          (x) =>
            x.coordinates[0] === currentBodyPiece.coordinates[0] &&
            x.coordinates[1] === currentBodyPiece.coordinates[1]
        )[0].nextDirection

        if (currentBodyPiece.tail) this.turningPoints.shift()
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
      tempSnake.head.coordinates[0] === this.state.foodCoordinate[0] &&
      tempSnake.head.coordinates[1] === this.state.foodCoordinate[1]
    ) {
      let newScore = this.state.currentScore + 5
      let newFoodX = 0
      let newFoodY = 0

      while (true) {
        newFoodY = this.getRandomInt(0, this.boardHeight - 1)
        newFoodX = this.getRandomInt(0, this.boardWidth - 1)

        if (
          newFoodY === this.state.foodCoordinate[0] &&
          newFoodX === this.state.foodCoordinate[1]
        )
          continue

        if (tempSnake.isOn([newFoodY, newFoodX])) continue

        break
      }

      tempSnake.eat()
      this.eatAudio.play()

      this.setState({
        snake: tempSnake,
        currentScore: newScore,
        foodCoordinate: [newFoodY, newFoodX],
        foodClass: this.foodClasses[
          this.getRandomInt(0, this.foodClasses.length - 1)
          ]
      })
    } else {
      this.setState({snake: tempSnake})
    }
  }

  gameOver() {
    this.gameOverAudio.play()

    clearInterval(this.intervalId)
    this.turningPoints = []
    let gameOverMsg = 'GAME OVER!'
    let bestScore = this.getBestScore(this.mode)
    if (this.state.currentScore > bestScore) {
      localStorage.setItem(this.mode + "BestScore", this.state.currentScore)
      bestScore = this.state.currentScore
      gameOverMsg = "NEW BEST!"
    }

    this.setState({
      gameOverDisplay: true,
      bestScore: bestScore,
      gameOverMsg: gameOverMsg
    })

    if (this.props.onGameOver) {
      this.props.onGameOver(this.mode, this.state.currentScore)
    }
  }

  getBestScore(mode) {
    let bestScore = localStorage.getItem(mode + "BestScore")
    bestScore = bestScore === null ? 0 : parseInt(bestScore)
    return bestScore
  }

  getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  onSwipeMove(position, event) {
    if (this.state.gameMenuDisplay || this.state.gameOverDisplay) return

    let tolerance = 2
    let x = position.x
    let y = position.y

    if (this.allowSwipe) {
      if (Math.abs(x) > tolerance || Math.abs(y) > tolerance) {
        this.allowSwipe = false
        if (Math.abs(y) > Math.abs(x))
          this.keyListner({keyCode: y > 0 ? 40 : 38})
        else
          this.keyListner({keyCode: x > 0 ? 39 : 37})
      }
    }
  }

  render() {
    return (
      <div
        className="app-bg"
        onTouchStart={() => {
          this.allowSwipe = true
        }}
      >
        <Swipe
          className="full-height flex flex-center"
          onSwipeMove={this.onSwipeMove}
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
                    bestScore={this.state.bestScore}
                    currentScore={this.state.currentScore}
                  />
                </div>
              </div>
            </div>

            <div className="border mt-2">
              <GameBoard
                getRandomInt={this.getRandomInt}
                boardWidth={this.boardWidth}
                boardHeight={this.boardHeight}
                snake={this.state.snake}
                currentScore={this.state.currentScore}
                foodCoordinate={this.state.foodCoordinate}
                foodClass={this.state.foodClass}
                gameOverDisplay={this.state.gameOverDisplay}
              />
            </div>

            {this.state.gameMenuDisplay && (
              <div className="border menu-overlay margin-top-10">
                <div className="flex flex-center">
                  {/*<div className="snake-food snake menu-food mr-4"></div>*/}
                  <div className="game-over-text">SELECT A MODE</div>
                  {/*<div className="snake-food snake invert menu-food ml-4"></div>*/}
                </div>
                <div className="flex mt-2">
                  <span
                    onClick={this.startGame.bind(this, 200)}
                    className="snakeButton mr-1"
                  >
                    EASY
                  </span>
                  <span
                    onClick={this.startGame.bind(this, 120)}
                    className="snakeButton mr-1 ml-1"
                  >
                    MEDIUM
                  </span>
                  <span
                    onClick={this.startGame.bind(this, 75)}
                    className="snakeButton ml-1"
                  >
                    HARD
                  </span>
                </div>
              </div>
            )}

            {this.state.gameOverDisplay && (
              <div className="border gameover-overlay margin-top-10">
                <div className="game-over-text">
                  {this.state.gameOverMsg}
                </div>
                <div className={"width-500px bdbx text-right font-size-24 "}>
                  <span className={"bg-trans border-width-1 round-5 border-white  padding-hor-20"}>{this.mode.toString().toUpperCase()}</span>
                </div>
                <div className={"flex-column height-340px width-500px bdbx"} style={{overflowY: 'auto'}}>
                  <div className={"flex-row font-size-24 full-width bdbx primary"} key={'score-header'}>
                    <span className={"width-5"}>#</span>
                    <span className={"width-15 text-wrap"}>Name</span>
                    <span className={"width-15"}>Score</span>
                    <span className={"width-30 text-center"}>Wallet</span>
                    <span className={"width-40 text-right"}>Time</span>
                  </div>
                  {this.props.scores.map((it, index) => {
                    return <div className={"flex-row font-size-24 full-width bdbx " + (it.self ? " info" : "")} key={'score-' + index}>
                      <span className={"width-5"}>{index + 1}</span>
                      <span className={"width-20 text-wrap"}>{it.nickname}</span>
                      <span className={"width-5"}>{it.score}</span>
                      <span className={"width-30 text-center"}>{it.address.substr(0, 5)}...{it.address.substr(-5)}</span>
                      <span className={"width-40 text-right"}>{it.time ? new Date(it.time).toLocaleString() : "Unknown"}</span>
                    </div>
                  })}
                </div>
                <div className="flex margin-vert-10">
                  <span
                    onClick={this.endGame}
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
}


const Play = () => {
  const [scores, setScores] = useState([])
  const {address, nickname, canPlay} = useSelector(state => state.app)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  console.log('Play', address, nickname)

  const onGameOver = (mode, score) => {
    dispatch(setCanPlay(false))
    FBDB.writeData({
      address,
      nickname,
      score,
      mode
    })
    FBDB.readData(mode)
      .then(res => {
        // console.log('score', res)
        let _scores = []
        for (let key in res) {
          if (res.hasOwnProperty(key)) {
            const value = {
              address: key,
              nickname: res[key].nickname || "Anonymous",
              score: res[key].score || 0,
              time: res[key].played_at,
              self: address === key
            }
            _scores.push(value)
            _scores.push(value)
            _scores.push(value)
            _scores.push(value)
            _scores.push(value)
          }
        }
        // console.log('scores-before', _scores)
        _scores = _scores.sort((a, b) => {
          if (a.score < b.score) {
            return 1
          } else {
            return -1
          }
        })
        // console.log('scores-after', _scores)
        setScores(_scores)
      })
  }

  const subscribeScore = (mode) => {
  }

  useEffect(() => {
    if (!address || !nickname) {
      navigate('/')
    }

    subscribeScore()
  }, [address, nickname])

  return (
    <Container><Game onGameOver={onGameOver} canPlay={canPlay} navigate={navigate} scores={scores}/></Container>)
}

export default Play
