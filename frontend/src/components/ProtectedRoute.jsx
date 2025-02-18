import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const Backend_Url = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log("Checking authentication...");
                const token = localStorage.getItem("token");
        
                if (!token) {
                    throw new Error("No token found");
                }
        
                const response = await fetch(`${Backend_Url}/auth/check`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the request headers
                    },
                });
        
                if (!response.ok) {
                    throw new Error("Auth check failed");
                }
        
                const data = await response.json();
                console.log("Auth check response:", data);
        
                if (data.authenticated && data.user) {
                    setIsAuthenticated(true);
                    localStorage.setItem("user", JSON.stringify(data.user));
                } else {
                    setIsAuthenticated(false);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Optionally, set up a periodic auth check (e.g., every 5 minutes)
        const interval = setInterval(checkAuth, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [Backend_Url]);

    if (isLoading) {
        return (
            <div className="loading-spinner">
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
