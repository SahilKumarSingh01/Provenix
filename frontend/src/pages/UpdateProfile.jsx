import React, { useState, useRef } from 'react';
import ImageUploader from '../components/ImageUpload';
import styles from '../styles/UpdateProfile.module.css';

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Frontend developer passionate about React',
    profileImage: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [crop, setCrop] = useState({ aspect: 1 / 1 });
  const [src, setSrc] = useState(null);
  const imgRef = useRef(null);

  // Form Handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrors(prev => ({ ...prev, form: 'Failed to update profile' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.filtersSection}>
        <h2 style={{ color: '#64FFDA', marginBottom: '1.5rem' }}>Update Profile</h2>

        {errors.form && <div className={styles.errorMessage}>{errors.form}</div>}

        <form onSubmit={handleSubmit} className={styles.profileForm}>
          <div className={styles.formGroup}>
            <label>Profile Picture</label>
            <ImageUploader 
              onFileSelect={() => {}}
              initialImage={formData.profileImage}
              className={styles.profileUploader}
              isLoading={loading}
            />
            {errors.profileImage && <div className={styles.errorMessage}>{errors.profileImage}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              className={styles.searchInput}
              disabled={loading}
            />
            {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className={styles.searchInput}
              disabled={loading}
            />
            {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              className={styles.searchInput}
              rows="4"
              style={{ resize: 'vertical' }}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              className={styles.searchInput}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
          </div>

          <button 
            type="submit" 
            className={styles.pageButton}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>

          {showSuccess && <div className={styles.successMessage}>Profile updated successfully!</div>}
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
