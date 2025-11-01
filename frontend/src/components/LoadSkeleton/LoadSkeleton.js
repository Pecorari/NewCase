import "./skeleton.css";

const Skeleton = ({ width = "100%", height = "16px", marginBottom = "0px", marginLeft = "0px", rounded = "8px" }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        marginBottom,
        marginLeft,
        borderRadius: rounded
      }}
    />
  );
};

export default Skeleton;
