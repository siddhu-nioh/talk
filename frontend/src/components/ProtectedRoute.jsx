import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const Backend_Url = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log("Checking authentication...");
                const response = await fetch(`${Backend_Url}/auth/check`, {
                    method: 'GET',
                    credentials: "include",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error('Auth check failed');
                }

                const data = await response.json();
                console.log("Auth check response:", data);

                if (data.authenticated && data.user) {
                    setIsAuthenticated(true);
                  
                    localStorage.setItem('user', JSON.stringify(data.user));
                } else {
                    setIsAuthenticated(false);
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

      
        const interval = setInterval(checkAuth, 5 * 60 * 1000); 
        return () => clearInterval(interval);
    }, [Backend_Url, navigate]);

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
