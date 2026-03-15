import { Nav } from "react-bootstrap";

function CategoryTabs({ categories, activeCategoryId, onSelectCategory }) {
  return (
    <Nav variant="pills" className="mb-4 flex-wrap">
      {categories.map((cat) => (
        <Nav.Item key={cat._id}>
          <Nav.Link
            active={activeCategoryId === cat._id}
            onClick={() => onSelectCategory(cat._id)}
            className={activeCategoryId === cat._id ? "bg-danger border-0" : ""}
          >
            {cat.categoryName}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
}

export default CategoryTabs;
