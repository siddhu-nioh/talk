import './App.css';
import Footer from './components/Includes/Footer';
import Posts from './components/Posts/Posts';
import NewPost from './components/Posts/NewPost';
import User from './components/User/User';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBar from './components/Posts/Search';
import ShowUser from './components/User/SearchUserProfile';
import Followers from './components/User/Followers';
import Login from './components/User/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AboutUs from './components/User/AboutUs';
import ContactUs from './components/User/ContactUs';
import PrivacyPolicy from './components/User/PrivacyPolicy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/talk" element={<Posts />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Routes>
                  <Route path="/user/:id" element={<ShowUser />} />
                  <Route path="/user/followers/:id" element={<Followers />} />
                  <Route path="/talk/search" element={<SearchBar />} />
                  <Route path="/talk/user" element={<User />} />
                  <Route path="/talk/new" element={<NewPost />} />
                  <Route path="/talk/about-us" element={<AboutUs />} />
                <Route path="/talk/contact-us" element={<ContactUs />} />
                <Route path="/talk/privacy-policy" element={<PrivacyPolicy />} />
                </Routes>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Footer is always shown */}
      <Footer />
    </Router>
  );
}

export default App;
