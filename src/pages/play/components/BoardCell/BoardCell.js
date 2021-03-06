
const BoardCell = (props) => {
    let cellType = props.cellType;
    let cell;

    switch (cellType) {
        case "none":
            cell = <div></div>;
            break;
        case "head":
            cell = <div className={`snake-head ${props.headDirection}`}></div>;
            break;
        case "body":
            cell = <div className="snake-body"></div>;
            break;
        case "food":
            cell = <div className={"snake-food " + props.foodClass}></div>;
            break;
        default:
            cell = <div></div>;
            break;
    }

    return <div className={`board-cell flex-center ${props.className}`}>{cell}</div>;
};

export default BoardCell;
