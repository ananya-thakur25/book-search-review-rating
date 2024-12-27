import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import BookSearch from './components/BookSearch/BookSearch';
import BookReviews from './components/BookReviews/BookReviews';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation */}
        <nav className="navbar">
          <h1>Book Exchange Club</h1>
          <div className="nav-links">
            <Link to="/search">Search Books</Link>
            <Link to="/reviews">Reviews</Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<BookSearch />} />
          <Route path="/search" element={<BookSearch />} />
          <Route path="/reviews" element={<BookReviews />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;