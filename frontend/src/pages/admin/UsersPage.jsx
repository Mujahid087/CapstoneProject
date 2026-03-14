import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/userSlice";
import { Table, Form, InputGroup } from "react-bootstrap";
import Loader from "../../components/Loader";

function UsersPage() {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.user);
    const [search, setSearch] = useState("");

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    const filteredUsers = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">👥 All Users</h3>
                <InputGroup style={{ maxWidth: "300px" }}>
                    <Form.Control
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
            </div>

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center text-muted">No users found</td>
                        </tr>
                    ) : (
                        filteredUsers.map((u, idx) => (
                            <tr key={u._id}>
                                <td>{idx + 1}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.phone || "N/A"}</td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </>
    );
}

export default UsersPage;
