import BoardCell from "../BoardCell/BoardCell"
import {React} from "react"

const GameBoard = (props) => {
  let board = []
  let boardWidth = props.boardWidth
  let boardHeight = props.boardHeight

  let snake = props.snake
  let foodCoordinate = props.foodCoordinate

  for (let i = 0; i < boardHeight; i++) {
    let row = []

    for (let j = 0; j < boardWidth; j++) {
      let key = 'board-cell-' + i + '-' + j
      if (snake.isHead([i, j])) row.push(<BoardCell cellType="head" key={key} headDirection={snake.head.direction}/>)
      else if (snake.isOn([i, j]))
        row.push(<BoardCell cellType="body" key={key}/>)
      else if (foodCoordinate[0] === i && foodCoordinate[1] === j)
        row.push(
          <BoardCell foodClass={props.foodClass} cellType="food" key={key}/>
        )
      else row.push(<BoardCell cellType="none" key={key}/>)
    }

    board.push(row)
  }
  return (
    <div className="flex">
      <div className="game-board">{board}</div>
    </div>
  )
}

export default GameBoard
