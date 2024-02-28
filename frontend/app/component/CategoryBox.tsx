"use client";
interface CategoryBoxProps {
  title: string;
  imageUrl: string;
  onClick?: () => void;
  isActive?: boolean;
}
const CategoryBox = ({
  title,
  imageUrl,
  onClick,
  isActive,
}: CategoryBoxProps) => {
  return (
    <div>
      {title}
      <img src={imageUrl} />
      <button onClick={onClick}>{isActive ? "Active" : "Inactive"}</button>
    </div>
  );
};

export default CategoryBox;
