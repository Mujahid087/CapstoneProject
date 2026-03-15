import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, fetchPublicMenuItems } from "../../redux/menuSlice";
import { addToCart } from "../../redux/cartSlice";
import { addFavorite, removeFavorite } from "../../redux/favoriteSlice";
import { Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import PizzaCustomizationModal from "../../components/PizzaCustomizationModal";
import CategoryTabs from "../../components/CategoryTabs";
import MenuItemGrid from "../../components/MenuItemGrid";
import { createSimpleCartItem, isPizzaCategory } from "../../utils/pizzaOptions";
import { useNavigate } from "react-router-dom";

const PRICE_RANGES = [
  { value: "all", label: "All Prices" },
  { value: "under-200", label: "Under Rs.200" },
  { value: "200-399", label: "Rs.200 - Rs.399" },
  { value: "400-plus", label: "Rs.400 and above" },
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function MenuPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, menuItems, loading } = useSelector((state) => state.menu);
  const { user, token } = useSelector((state) => state.auth);
  const favoriteItems = useSelector((state) => state.favorites.items);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [selectedItem, setSelectedItem] = useState(null);
  const resolvedCategory = activeCategory || categories[0]?._id || null;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPublicMenuItems());
  }, [dispatch]);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [category._id, category.categoryName])),
    [categories]
  );
  const favoriteIds = useMemo(() => favoriteItems.map((item) => item._id), [favoriteItems]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const indexedItems = menuItems.map((item, index) => ({ item, index }));

    return indexedItems
      .filter(({ item }) => {
        const matchesSearch =
          !normalizedSearch ||
          item.name?.toLowerCase().includes(normalizedSearch) ||
          item.description?.toLowerCase().includes(normalizedSearch);

        const matchesCategory = !resolvedCategory || item.categoryId === resolvedCategory;

        const price = Number(item.price || 0);
        const matchesPrice =
          priceRange === "all" ||
          (priceRange === "under-200" && price < 200) ||
          (priceRange === "200-399" && price >= 200 && price < 400) ||
          (priceRange === "400-plus" && price >= 400);

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((left, right) => {
        if (sortBy === "price-asc") {
          return left.item.price - right.item.price;
        }

        if (sortBy === "price-desc") {
          return right.item.price - left.item.price;
        }

        const leftPopularity = left.item.popularity ?? left.item.ordersCount ?? left.item.rating ?? 0;
        const rightPopularity = right.item.popularity ?? right.item.ordersCount ?? right.item.rating ?? 0;

        if (rightPopularity !== leftPopularity) {
          return rightPopularity - leftPopularity;
        }

        return left.index - right.index;
      })
      .map(({ item }) => item);
  }, [menuItems, priceRange, resolvedCategory, searchTerm, sortBy]);

  const handleAddToCart = (cartItem) => {
    dispatch(
      addToCart({
        userId: user.id,
        items: [cartItem],
        totalAmount: cartItem.price,
      })
    );
    toast.success(`${cartItem.name} added to cart!`);
  };

  const handleItemAction = (item) => {
    const categoryName = categoryMap[item.categoryId] || "";

    if (isPizzaCategory(categoryName)) {
      setSelectedItem(item);
      return;
    }

    handleAddToCart(createSimpleCartItem(item));
  };

  const handleToggleFavorite = (item) => {
    if (!token) {
      toast.info("Please login to save favorites");
      navigate("/login");
      return;
    }

    const action = favoriteIds.includes(item._id) ? removeFavorite(item._id) : addFavorite(item._id);
    dispatch(action).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.success(
          favoriteIds.includes(item._id)
            ? `${item.name} removed from favorites`
            : `${item.name} added to favorites`
        );
      }
    });
  };

  return (
    <>
      <h3 className="mb-4">Our Menu</h3>

      <CategoryTabs
        categories={categories}
        activeCategoryId={resolvedCategory}
        onSelectCategory={setActiveCategory}
      />

      <Row className="g-3 mb-4">
        <Col lg={5}>
          <InputGroup>
            <InputGroup.Text>Search</InputGroup.Text>
            <Form.Control
              placeholder="Find pizzas by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} lg={3}>
          <Form.Select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            {PRICE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6} lg={4}>
          <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : filteredItems.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <h5 className="text-muted">No items in this category.</h5>
            <p className="text-muted small mb-0">Try another search term, tab, or price range.</p>
          </Card.Body>
        </Card>
      ) : (
        <MenuItemGrid
          items={filteredItems}
          categoryMap={categoryMap}
          onItemAction={handleItemAction}
          allowFavorites
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      <PizzaCustomizationModal
        item={selectedItem}
        show={Boolean(selectedItem)}
        onHide={() => setSelectedItem(null)}
        onConfirm={handleAddToCart}
      />
    </>
  );
}

export default MenuPage;
