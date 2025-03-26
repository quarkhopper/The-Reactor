import emptyPanel from "/src/images/empty_panel.png";

export default function Panel() {
  return (
    <img
      src={emptyPanel}
      alt="Empty Panel"
      className="absolute inset-0 object-cover w-full h-full z-0"
    />
  );
}
