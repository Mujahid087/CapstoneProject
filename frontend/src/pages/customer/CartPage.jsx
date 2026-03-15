import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCart, removeCartItem, updateCartQuantity } from "../../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { Table, Button, Card, ButtonGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { formatCustomization } from "../../utils/pizzaOptions";

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(getCart(user.id));
    }
  }, [dispatch, user]);

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const getItemKey = (item) => item.cartKey || item.itemId;

  const handleIncrease = (item) => {
    dispatch(
      updateCartQuantity({
        userId: user.id,
        itemId: getItemKey(item),
        quantity: (item.quantity || 1) + 1,
      })
    );
  };

  const handleDecrease = (item) => {
    const newQty = (item.quantity || 1) - 1;
    if (newQty <= 0) {
      dispatch(removeCartItem({ userId: user.id, itemId: getItemKey(item) }));
      toast.info(`${item.name} removed from cart`);
    } else {
      dispatch(
        updateCartQuantity({
          userId: user.id,
          itemId: getItemKey(item),
          quantity: newQty,
        })
      );
    }
  };

  const handleRemove = (item) => {
    dispatch(removeCartItem({ userId: user.id, itemId: getItemKey(item) }));
    toast.info(`${item.name} removed from cart`);
  };

  if (loading) return <Loader />;

  return (
    <>
      <h3 className="mb-4">Your Cart</h3>

      {items.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <div className="fs-1 mb-3">Cart</div>
            <h5 className="text-muted">Your cart is empty</h5>
            <p className="text-muted small mb-3">Add some delicious items from our menu.</p>
            <Button variant="danger" size="lg" onClick={() => navigate("/menu")}>
              Browse Menu
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Item</th>
                <th className="text-end">Price</th>
                <th className="text-center">Quantity</th>
                <th className="text-end">Subtotal</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={getItemKey(item) || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="fw-semibold">{item.name}</div>
                    <div className="text-muted small">{formatCustomization(item.customization)}</div>
                  </td>
                  <td className="text-end">Rs.{item.price}</td>
                  <td className="text-center">
                    <ButtonGroup size="sm">
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDecrease(item)}
                        style={{ width: "32px" }}
                      >
                        -
                      </Button>
                      <Button variant="light" disabled style={{ width: "40px", fontWeight: "bold" }}>
                        {item.quantity || 1}
                      </Button>
                      <Button
                        variant="outline-success"
                        onClick={() => handleIncrease(item)}
                        style={{ width: "32px" }}
                      >
                        +
                      </Button>
                    </ButtonGroup>
                  </td>
                  <td className="text-end fw-bold">
                    Rs.{(item.price || 0) * (item.quantity || 1)}
                  </td>
                  <td className="text-center">
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemove(item)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-danger fw-bold">
                <td colSpan="4" className="text-end">Total</td>
                <td className="text-end fs-5">Rs.{totalAmount}</td>
                <td></td>
              </tr>
            </tfoot>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-white rounded shadow-sm">
            <div>
              <span className="text-muted">Items: {items.length}</span>
              <span className="text-muted ms-3">
                Qty: {items.reduce((sum, i) => sum + (i.quantity || 1), 0)}
              </span>
            </div>
            <Button variant="danger" size="lg" onClick={() => navigate("/checkout")}>
              Proceed to Order
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export default CartPage;
