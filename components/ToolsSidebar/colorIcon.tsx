function ColorIcon({ fillColor }: { fillColor: string }) {
  return (
    <div
      className="w-5 h-5 rounded-md size-5"
      style={{ backgroundColor: fillColor }}
    />
  );
}

export default ColorIcon;
