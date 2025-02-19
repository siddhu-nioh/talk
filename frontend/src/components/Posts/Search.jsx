import { useState } from 'react';
import './Searchbar.css';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Import icons

function SearchBar() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const Backend_Url = import.meta.env.VITE_BACKEND_URL;

    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim().length >= 2) {
            try {
                const response = await fetch(`${Backend_Url}/talk/search/users?query=${encodeURIComponent(value)}`);
                const data = await response.json();
                console.log('Fetched Users:', data);
                setUsers(data);
                setShowSuggestions(data.length > 0);
            } catch (error) {
                console.error('Error fetching search results:', error);
                setUsers([]);
                setShowSuggestions(false);
            }
        } else {
            setUsers([]);
            setShowSuggestions(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setUsers([]);
        setShowSuggestions(false);
    };

    return (
        <div className="main">
            <div className="search-container">
                <div className="search-bar">
                    {/* Search Icon */}
                    <FaSearch className="search-icon" />

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search"
                        autoComplete="off"
                        value={query}
                        onChange={handleSearch}
                    />

                    {/* Clear Icon (visible only when there's a query) */}
                    {query && (
                        <FaTimes className="clear-icon" onClick={clearSearch} />
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div className="suggestions">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <a
                                key={user._id}
                                href={`/user/${user._id}`}
                            >
                                <img src={user.profile} alt="Profile" />
                                <span>{user.username}</span>
                            </a>
                        ))
                    ) : (
                        <div>No results found</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
