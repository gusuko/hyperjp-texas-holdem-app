const Chip = ({ value, imageSrc, onClick }) => {
  return (
    <img
      src={imageSrc}
      alt={`$${value} chip`}
      onClick={onClick}
      style={{
        width: '70px', // ←大きく！
        height: '70px',
        cursor: 'pointer',
        margin: 0,
      }}
    />
  );
};

export default Chip;
