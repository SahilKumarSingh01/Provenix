import React, { useState } from 'react';
import CourseCard from '../components/CourseCard';
import styles from '../styles/Search.module.css'; // ✅ Updated to use CSS module

const Search = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const filteredCourses = coursesData
    .filter(course => 
      (keyword === '' || course.title.toLowerCase().includes(keyword.toLowerCase())) &&
      (category === '' || course.category === category) &&
      (minPrice === '' || course.price >= parseFloat(minPrice)) &&
      (maxPrice === '' || course.price <= parseFloat(maxPrice))
    )
    .sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles.searchContainer}>
      <h2 className={styles.title}>Search Courses</h2>

      {/* 🔹 Filters */}
      <div className={styles.filters}>
        <input 
          type="text" 
          placeholder="Search courses..." 
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)} 
          className={styles.input}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={styles.select}>
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Programming">Programming</option>
          <option value="Data Science">Data Science</option>
          <option value="AI & ML">AI & ML</option>
          <option value="App Development">App Development</option>
        </select>
        <input 
          type="number" 
          placeholder="Min Price" 
          value={minPrice} 
          onChange={(e) => setMinPrice(e.target.value)} 
          className={styles.input}
        />
        <input 
          type="number" 
          placeholder="Max Price" 
          value={maxPrice} 
          onChange={(e) => setMaxPrice(e.target.value)} 
          className={styles.input}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.select}>
          <option value="">Sort By</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* 🔹 Course List */}
      <div className={styles.courseGrid}>
        {paginatedCourses.length > 0 ? (
          paginatedCourses.map(course => <CourseCard key={course.id} course={course} />)
        ) : (
          <p className={styles.noResults}>No courses found.</p>
        )}
      </div>

      {/* 🔹 Pagination */}
      <div className={styles.pagination}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Search;
