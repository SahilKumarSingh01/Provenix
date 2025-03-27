import styles from "../styles/ConfirmBox.module.css";

const ConfirmBox = ({ message, onCancel, onConfirm }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.confirmBox}>
        <h2>Confirmation Box</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
            <button className={styles.actionButton} onClick={onConfirm}>
                Confirm
            </button>
            <button className={styles.cancelButton} onClick={onCancel}>
                Cancel
            </button>
          
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
