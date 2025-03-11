import React, { useState, useRef } from 'react';
import ImageUploader from '../components/ImageUpload';
// import ReactCrop from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';
import '../styles/UpdateProfile.css';

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

  // Image Handling
  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate image
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profileImage: 'Please upload a valid image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profileImage: 'File size must be less than 5MB' }));
      return;
    }

    // Read image for cropping
    const reader = new FileReader();
    reader.addEventListener('load', () => setSrc(reader.result));
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (crop) => {
    if (imgRef.current && crop.width && crop.height) {
      getCroppedImg(imgRef.current, crop);
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    canvas.toBlob(async (blob) => {
      try {
        setLoading(true);
        // Simulate upload to cloud storage
        const uploadedUrl = await uploadImage(blob);
        setFormData(prev => ({ ...prev, profileImage: uploadedUrl }));
        setSrc(null);
        setErrors(prev => ({ ...prev, profileImage: null }));
      } catch (error) {
        setErrors(prev => ({ ...prev, profileImage: 'Failed to upload image' }));
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  const uploadImage = (blob) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(blob));
      }, 2000);
    });
  };

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrors(prev => ({ ...prev, form: 'Failed to update profile' }));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email address';
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  return (
    <div className="search-container" style={{ maxWidth: '800px' }}>
      <div className="filters-section" style={{ flexDirection: 'column' }}>
        <h2 style={{ color: '#64FFDA', marginBottom: '1.5rem' }}>Update Profile</h2>
        
        {errors.form && (
          <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Profile Picture</label>
            <ImageUploader 
              onFileSelect={handleImageUpload}
              initialImage={formData.profileImage}
              className="profile-uploader"
              isLoading={loading}
            />
            {errors.profileImage && (
              <div className="error-message">{errors.profileImage}</div>
            )}

            {src && (
              <div className="crop-modal">
                <ReactCrop
                  crop={crop}
                  onChange={c => setCrop(c)}
                  onComplete={handleCropComplete}
                >
                  <img
                    ref={imgRef}
                    src={src}
                    alt="Crop preview"
                    style={{ maxWidth: '100%' }}
                  />
                </ReactCrop>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setSrc(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="search-input"
              disabled={loading}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="search-input"
              disabled={loading}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="search-input"
              rows="4"
              style={{ resize: 'vertical' }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="search-input"
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button 
            type="submit" 
            className="page-button"
            style={{ marginTop: '1rem', width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>

          {showSuccess && (
            <div className="success-message">
              Profile updated successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;