import React from 'react';
import { Link } from 'react-router-dom';
import defaultProfile from '../assets/defaultPicture.png';
import styles from '../styles/UserInfo.module.css';

const UserInfo = ({ user }) => {
  return (
    <div className={styles.userInfo}>
      <img 
        src={user.photo || defaultProfile} 
        alt="User Profile" 
        className={styles.userPhoto} 
      />
      <div>
        <p className={styles.displayName}>{user.displayName || user.username}</p>
        <Link to={`/profile/${user.username}`} className={styles.username}>
          @{user.username}
        </Link>
      </div>
    </div>
  );
};

export default UserInfo;
