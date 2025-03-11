import './App.css';
import Footer from './components/Includes/Footer';
import HomePosts from './components/Posts/HomePosts'; // Import the updated HomePosts component
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
import Reels from './components/Posts/Reels';
import TermsAndConditions from './components/User/TermsAndConditions'; // Add this component
import TalkPosts from './components/Posts/Posts';

function App() {
  return (
    <Router>
      <Routes>
        {/* HomePosts is the default landing page */}
        <Route path="/" element={<HomePosts />} />
        <Route path="/talk" element={<TalkPosts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/talk/about-us" element={<AboutUs />} />
                  <Route path="/talk/contact-us" element={<ContactUs />} />
                  <Route path="/talk/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/talk/terms-and-conditions" element={<TermsAndConditions />} />
        {/* Protected Routes */}
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
               
                  <Route path="/reels" element={<Reels />} />
                  <Route path="/reels/:id" element={<Reels />} />
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