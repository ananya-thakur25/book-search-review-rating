import React, { useState } from 'react';
import './BookSearch.css';

function BookSearch() {
  const [isbn, setIsbn] = useState('');
  const [bookData, setBookData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* Fetching */
  
  const handleSearch = async () => {
    if (!isbn) {
      setError('Please enter an ISBN');
      return;
    }

    setIsLoading(true);
    setError('');
    setBookData(null);

    try {
      const apiUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=details`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      const bookKey = `ISBN:${isbn}`;
      const book = data[bookKey];

      if (!book || Object.keys(data).length === 0) {
        setError('Book not found. Please check the ISBN and try again.');
        return;
      }

      console.log('API Response:', data);

      setBookData({
        title: book.details?.title || 'Unknown Title',
        authors: book.details?.authors?.[0]?.name || 'Unknown Author',
        publish_date: book.details?.publish_date || 'Unknown',
        publisher: book.details?.publishers?.[0] || 'Unknown Publisher'
      });
    } catch (err) {
      setError('Error searching for book. Please try again later.');
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /* End of fetching */
  
  return (
    <div className="book-search-container">
      <div className="search-header">
        <h2>📚 Find Your Next Book</h2>
        <p>Enter an ISBN to discover book details</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value.trim())}
          onKeyPress={handleKeyPress}
          placeholder="Enter ISBN (e.g., 0451524934)"
          className="search-input"
        />
        <button 
          onClick={handleSearch} 
          disabled={isLoading} 
          className="search-button"
        >
          {isLoading ? 'Searching...' : '🔍 Search'}
        </button>
      </div>

      {error && <p className="error-message">❌ {error}</p>}

      {bookData && (
        <div className="book-result">
          <h3 className="book-title">{bookData.title}</h3>
          <div className="book-details">
            <p><span>Author:</span> {bookData.authors}</p>
            <p><span>Published:</span> {bookData.publish_date}</p>
            <p><span>Publisher:</span> {bookData.publisher}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookSearch;