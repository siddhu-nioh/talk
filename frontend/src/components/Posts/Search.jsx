import { useState } from 'react';
import './Search.css';
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
        <div className="main bg-white min-h-screen p-4">
            <div className="search-container relative max-w-md mx-auto">
                <div className="flex items-center bg-black rounded-full p-2">
                    {/* Search Icon */}
                    <FaSearch className="text-white ml-2" />

                    {/* Search Input */}
                    <input
                        type="text"
                        id="search-bar"
                        className="search-bar flex-grow p-2 bg-transparent text-white placeholder-gray-400 outline-none"
                        placeholder="Search"
                        autoComplete="off"
                        value={query}
                        onChange={handleSearch}
                    />

                    {/* Clear Icon (visible only when there's a query) */}
                    {query && (
                        <button onClick={clearSearch} className="text-white mr-2">
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                    <div className="suggestions absolute top-full left-0 w-full bg-white border rounded-md shadow-lg mt-2">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <a
                                    key={user._id}
                                    href={`/user/${user._id}`}
                                    className="flex items-center p-2 hover:bg-gray-100"
                                >
                                    <img
                                        src={user.profile}
                                        className="w-8 h-8 rounded-full mr-2"
                                        alt="Profile"
                                    />
                                    <span className="text-black">{user.username}</span>
                                </a>
                            ))
                        ) : (
                            <div className="p-2 text-gray-500">No results found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchBar;
// import { useState } from 'react';
// import './Search.css';

// function SearchBar() {
//       const [query, setQuery] = useState('');
//       const [users, setUsers] = useState([]);
//       const [showSuggestions, setShowSuggestions] = useState(false);
//       const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//       const handleSearch = async (e) => {
//             const value = e.target.value;
//             setQuery(value);

//             if (value.trim().length >= 2) {
//                   try {
//                         const response = await fetch(`${Backend_Url}/talk/search/users?query=${encodeURIComponent(value)}`);
//                         const data = await response.json();
//                         console.log('Fetched Users:', data);
//                         setUsers(data);
//                         setShowSuggestions(data.length > 0);
//                   } catch (error) {
//                         console.error('Error fetching search results:', error);
//                         setUsers([]);
//                         setShowSuggestions(false);
//                   }
//             } else {
//                   setUsers([]);
//                   setShowSuggestions(false);
//             }
//       };

//       return (
//             <div className="main">
//                   <div className="search-container p-4 relative">
//                         <input
//                               type="text"
//                               id="search-bar"
//                               className="search-bar w-full p-2 border rounded-md"
//                               placeholder="Search"
//                               autoComplete="off"
//                               value={query}
//                               onChange={handleSearch}
//                         />
//                         {showSuggestions && (
//                               <div className="suggestions absolute top-full left-0 w-full bg-white border rounded-md shadow-lg">
//                                     {users.length > 0 ? (
//                                           users.map((user) => (
//                                                 <a key={user._id} href={`/user/${user._id}`} className="flex items-center p-2 hover:bg-gray-100">
//                                                       <img src={user.profile} className="w-8 h-8 rounded-full mr-2" alt="Profile" />
//                                                       <span>{user.username}</span>
//                                                 </a>
//                                           ))
//                                     ) : (
//                                           <div className="p-2 text-gray-500">No results found</div>
//                                     )}
//                               </div>
//                         )}
//                   </div>
//             </div>
//       );
// };

// export default SearchBar;
