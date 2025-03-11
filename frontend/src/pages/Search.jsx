import React, { useState } from 'react';
import CourseCard from '../components/CourseCard'; // Your existing CourseCard component
import styles from '../styles/Search.css'; // CSS module for Search component

const coursesData = [
  { id: 1, title: 'React for Beginners', category: 'Web Development', price: 20 },
  { id: 2, title: 'Advanced JavaScript', category: 'Programming', price: 30 },
  { id: 3, title: 'Python for Data Science', category: 'Data Science', price: 40 },
  { id: 4, title: 'Machine Learning Basics', category: 'AI & ML', price: 50 },
  { id: 5, title: 'Web Design Masterclass', category: 'Web Development', price: 25 },
  { id: 6, title: 'Django Full Course', category: 'Web Development', price: 35 },
  { id: 7, title: 'C++ Algorithms', category: 'Programming', price: 28 },
  { id: 8, title: 'Flutter Mobile Apps', category: 'App Development', price: 45 },
];

const Search = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // 🔹 Filter and sort courses
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

  // 🔹 Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles.searchContainer}>
      <h2 className={styles.title}>Search Courses</h2>
      
      {/* 🔹 Search Filters */}
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

      {/* 🔹 Courses Display */}
      <div className={styles.courseGrid}>
        {paginatedCourses.length > 0 ? (
          paginatedCourses.map(course => <CourseCard key={course.id} course={course} />)
        ) : (
          <p className={styles.noResults}>No courses found.</p>
        )}
      </div>

      {/* 🔹 Pagination Controls */}
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
