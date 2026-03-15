import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../../redux/userSlice";
import { placeOrder } from "../../redux/orderSlice";
import { clearCart } from "../../redux/cartSlice";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card, Button, Modal, Table, Form as BsForm } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { formatCustomization } from "../../utils/pizzaOptions";

const addressSchema = Yup.object({
  houseNumber: Yup.string().required("House number is required"),
  street: Yup.string().required("Street is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  landmark: Yup.string(),
});

function AddressPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addresses, loading } = useSelector((state) => state.user);
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState("delivery");

  useEffect(() => {
    if (user?.id) dispatch(getUserAddresses(user.id));
  }, [dispatch, user]);

  const handleSave = (values, { resetForm }) => {
    if (editAddress) {
      dispatch(updateAddress({ id: editAddress._id, data: values })).then((res) => {
        if (res.meta.requestStatus === "fulfilled") toast.success("Address updated");
      });
    } else {
      dispatch(addAddress({ ...values, userId: user.id })).then((res) => {
        if (res.meta.requestStatus === "fulfilled") toast.success("Address added");
      });
    }
    resetForm();
    setEditAddress(null);
    setShowModal(false);
  };

  const handleEdit = (addr) => {
    setEditAddress(addr);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this address?")) {
      dispatch(deleteAddress(id)).then((res) => {
        if (res.meta.requestStatus === "fulfilled") toast.success("Address deleted");
      });
    }
  };

  const handlePlaceOrder = (addressId) => {
    const allItems = items.flatMap((cart) => (cart.items ? cart.items : [cart]));
    const totalAmount = allItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    dispatch(
      placeOrder({
        userId: user.id,
        addressId,
        items: allItems.map((item) => ({
          itemId: item.itemId,
          cartKey: item.cartKey,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          customization: item.customization,
        })),
        totalAmount,
        deliveryMode,
      })
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        dispatch(clearCart(user.id));
        toast.success("Order placed successfully!");
        navigate("/orders");
      }
    });
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">My Addresses</h3>
        <Button
          variant="danger"
          onClick={() => {
            setEditAddress(null);
            setShowModal(true);
          }}
        >
          + Add Address
        </Button>
      </div>

      {items.length > 0 && (
        <Card className="shadow-sm border-0 mb-4 border-start border-danger border-4">
          <Card.Body className="d-flex align-items-center gap-3 flex-wrap">
            <span>You have {items.length} item(s) in cart.</span>
            <BsForm.Select
              style={{ maxWidth: "160px" }}
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value)}
            >
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
            </BsForm.Select>
            <span className="text-muted small">Select an address below to place order.</span>
          </Card.Body>
          <Card.Footer className="bg-white border-0 pt-0">
            <div className="small text-muted">
              {items.map((item) => `${item.name} (${formatCustomization(item.customization)})`).join(" | ")}
            </div>
          </Card.Footer>
        </Card>
      )}

      {addresses.length === 0 ? (
        <p className="text-muted">No addresses saved. Add one to place an order.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Address</th>
              <th>Pincode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((addr, idx) => (
              <tr key={addr._id}>
                <td>{idx + 1}</td>
                <td>
                  {addr.houseNumber}, {addr.street}, {addr.city}, {addr.state}
                  {addr.landmark && ` (Near ${addr.landmark})`}
                </td>
                <td>{addr.pincode}</td>
                <td>
                  <div className="d-flex gap-1 flex-wrap">
                    <Button variant="outline-primary" size="sm" onClick={() => handleEdit(addr)}>
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(addr._id)}>
                      Delete
                    </Button>
                    {items.length > 0 && (
                      <Button variant="success" size="sm" onClick={() => handlePlaceOrder(addr._id)}>
                        Order Here
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editAddress ? "Edit Address" : "Add Address"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            enableReinitialize
            initialValues={{
              houseNumber: editAddress?.houseNumber || "",
              street: editAddress?.street || "",
              city: editAddress?.city || "",
              state: editAddress?.state || "",
              pincode: editAddress?.pincode || "",
              landmark: editAddress?.landmark || "",
            }}
            validationSchema={addressSchema}
            onSubmit={handleSave}
          >
            {() => (
              <Form>
                {["houseNumber", "street", "city", "state", "pincode", "landmark"].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label text-capitalize">
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                    <Field name={field} className="form-control" />
                    <ErrorMessage name={field} component="div" className="text-danger small mt-1" />
                  </div>
                ))}
                <Button type="submit" variant="danger" className="w-100">
                  {editAddress ? "Update" : "Save"} Address
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddressPage;
