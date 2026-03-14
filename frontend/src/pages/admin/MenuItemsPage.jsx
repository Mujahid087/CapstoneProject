import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    fetchCategories,
} from "../../redux/menuSlice";
import { Table, Button, Modal, Form, Badge, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

function MenuItemsPage() {
    const dispatch = useDispatch();
    const { allMenuItems, categories, loading } = useSelector((state) => state.menu);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        image: "",
        isAvailable: true,
    });

    useEffect(() => {
        dispatch(fetchAllMenuItems());
        dispatch(fetchCategories());
    }, [dispatch]);

    const openAdd = () => {
        setEditItem(null);
        setForm({
            name: "",
            description: "",
            price: "",
            categoryId: categories[0]?._id || "",
            image: "",
            isAvailable: true,
        });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            name: item.name,
            description: item.description || "",
            price: item.price,
            categoryId: item.categoryId?._id || item.categoryId,
            image: item.image || "",
            isAvailable: item.isAvailable,
        });
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const data = { ...form, price: Number(form.price) };

        if (editItem) {
            dispatch(updateMenuItem({ id: editItem._id, data })).then((res) => {
                if (res.meta.requestStatus === "fulfilled") toast.success("Menu item updated");
            });
        } else {
            dispatch(createMenuItem(data)).then((res) => {
                if (res.meta.requestStatus === "fulfilled") toast.success("Menu item created");
            });
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this menu item?")) {
            dispatch(deleteMenuItem(id)).then((res) => {
                if (res.meta.requestStatus === "fulfilled") toast.success("Menu item deleted");
            });
        }
    };

    const filteredItems = allMenuItems.filter(
        (item) =>
            item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.categoryId?.categoryName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h3 className="mb-0">🍕 Menu Items</h3>
                <div className="d-flex gap-2">
                    <InputGroup style={{ maxWidth: "250px" }}>
                        <Form.Control
                            placeholder="Search items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputGroup>
                    <Button variant="danger" onClick={openAdd}>+ Add Item</Button>
                </div>
            </div>

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Available</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center text-muted">No menu items found</td>
                        </tr>
                    ) : (
                        filteredItems.map((item, idx) => (
                            <tr key={item._id}>
                                <td>{idx + 1}</td>
                                <td>{item.name}</td>
                                <td className="text-muted small">{item.description || "—"}</td>
                                <td>₹{item.price}</td>
                                <td>{item.categoryId?.categoryName || "N/A"}</td>
                                <td>
                                    <Badge bg={item.isAvailable ? "success" : "secondary"}>
                                        {item.isAvailable ? "Yes" : "No"}
                                    </Badge>
                                </td>
                                <td>
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEdit(item)}>
                                        Edit
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item._id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editItem ? "Edit Menu Item" : "Add Menu Item"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSave}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price (₹)</Form.Label>
                            <Form.Control type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="1" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            label="Available"
                            checked={form.isAvailable}
                            onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                            className="mb-3"
                        />
                        <Button type="submit" variant="danger" className="w-100">
                            {editItem ? "Update" : "Create"} Item
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default MenuItemsPage;
