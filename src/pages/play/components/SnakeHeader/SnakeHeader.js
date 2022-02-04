import LogoImage from '../../../../assets/images/logo.png';

function SnakeHeader() {
  return (
    <div className="flex">
      <div className="title">
        <span className="pr-3"><img src={LogoImage} alt='' className="head-icons"/>SNAKE</span>
      </div>
    </div>
  );
}

export default SnakeHeader;
