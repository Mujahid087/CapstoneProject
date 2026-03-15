import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { Container } from "react-bootstrap";
import { fetchFavorites } from "../redux/favoriteSlice";

function CustomerLayout() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchFavorites());
        }
    }, [dispatch, user]);

    return (
        <>
            <Navbar />
            <Container className="py-4">
                <Outlet />
            </Container>
        </>
    );
}

export default CustomerLayout;
