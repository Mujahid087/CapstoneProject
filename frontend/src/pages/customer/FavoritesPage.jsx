import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { fetchCategories } from "../../redux/menuSlice";
import { addToCart } from "../../redux/cartSlice";
import { removeFavorite } from "../../redux/favoriteSlice";
import Loader from "../../components/Loader";
import MenuItemGrid from "../../components/MenuItemGrid";
import PizzaCustomizationModal from "../../components/PizzaCustomizationModal";

function FavoritesPage() {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.menu);
  const { items, loading } = useSelector((state) => state.favorites);
  const { user } = useSelector((state) => state.auth);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [categories.length, dispatch]);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [category._id, category.categoryName])),
    [categories]
  );

  const favoriteIds = useMemo(() => items.map((item) => item._id), [items]);

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
    setSelectedItem(item);
  };

  const handleRemoveFavorite = (item) => {
    dispatch(removeFavorite(item._id)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.info(`${item.name} removed from favorites`);
      }
    });
  };

  if (loading) return <Loader />;

  return (
    <>
      <h3 className="mb-4">Your Favorites</h3>

      {items.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <h5 className="text-muted">No favorites saved yet.</h5>
            <p className="text-muted small mb-0">Tap the heart on pizzas you like and they will appear here.</p>
          </Card.Body>
        </Card>
      ) : (
        <MenuItemGrid
          items={items}
          categoryMap={categoryMap}
          onItemAction={handleItemAction}
          allowFavorites
          favoriteIds={favoriteIds}
          onToggleFavorite={handleRemoveFavorite}
          primaryActionLabel={() => "Add to Cart"}
          secondaryActionLabel={() => "Remove Favorite"}
          onSecondaryAction={handleRemoveFavorite}
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

export default FavoritesPage;
