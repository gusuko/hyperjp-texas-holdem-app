export default function CurrentChips({ chips, style = {} }) {
  return (
    <div className="current-chips" style={style}>
      💰 {chips}
    </div>
  );
}
