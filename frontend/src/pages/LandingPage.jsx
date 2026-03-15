import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCategories, fetchMenuByCategory } from "../redux/menuSlice";
import { addToCart } from "../redux/cartSlice";
import { addFavorite, removeFavorite } from "../redux/favoriteSlice";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import PizzaCustomizationModal from "../components/PizzaCustomizationModal";
import { createSimpleCartItem, isPizzaCategory } from "../utils/pizzaOptions";
import CategoryTabs from "../components/CategoryTabs";
import MenuItemGrid from "../components/MenuItemGrid";

function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, menuItems, loading } = useSelector((state) => state.menu);
  const { token, user } = useSelector((state) => state.auth);
  const favoriteItems = useSelector((state) => state.favorites.items);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const resolvedCategory = activeCategory || categories[0]?._id || null;
  const categoryMap = Object.fromEntries(
    categories.map((category) => [category._id, category.categoryName])
  );
  const favoriteIds = favoriteItems.map((item) => item._id);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (resolvedCategory) {
      dispatch(fetchMenuByCategory(resolvedCategory));
    }
  }, [dispatch, resolvedCategory]);

  const handleAddToCart = (cartItem) => {
    if (!token) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }

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
      <Navbar />
      <div className="bg-dark text-white text-center py-5">
        <Container>
          <h1 className="display-5 fw-bold mb-3">PizzaHub</h1>
          <p className="lead mb-0">
            Freshly baked pizzas delivered to your doorstep. Browse the menu and customize every order.
          </p>
        </Container>
      </div>

        <Container className="py-4">
          <h3 className="mb-4">Our Menu</h3>

        <CategoryTabs
          categories={categories}
          activeCategoryId={resolvedCategory}
          onSelectCategory={setActiveCategory}
        />

        {loading ? (
          <Loader />
        ) : menuItems.length === 0 ? (
          <p className="text-muted">No items in this category.</p>
        ) : (
          <MenuItemGrid
            items={menuItems}
            categoryMap={categoryMap}
            onItemAction={handleItemAction}
            allowFavorites
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </Container>

      <PizzaCustomizationModal
        item={selectedItem}
        show={Boolean(selectedItem)}
        onHide={() => setSelectedItem(null)}
        onConfirm={handleAddToCart}
      />
    </>
  );
}

export default LandingPage;
