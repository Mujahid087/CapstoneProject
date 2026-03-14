import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const { token, role } = useSelector((state) => state.auth);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/menu" replace />;
    }

    return children;
}

export default ProtectedRoute;
