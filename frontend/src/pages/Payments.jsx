import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
// import BackspaceButton from "../components/BackspaceButton.jsx"

import axios from '../api/axios';
import styles from '../styles/Payments.module.css';
import { toast } from 'react-toastify';

const Payments = () => {
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enrollmentId } = useParams();

  const fetchEnrollment = async () => {
    try {
      const { data } = await axios.get(`/api/enrollment/${enrollmentId}`);
      setEnrollment(data.enrollment);
      toast.success(data.message);
    } catch (err) {
      console.error("Error fetching enrollment:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const recheckStatus = async (orderId) => {
    try {
      const { data } = await axios.post(`/api/enrollment/${enrollmentId}/verify-payment`, {orderId});
      toast.success(data.message);
      setEnrollment(data.enrollment);
    } catch (err) {
      console.error("Error rechecking order:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchEnrollment();
  }, []);

  if (loading||!enrollment) return <p>Loading payments...</p>;

  return (
    <div className={styles.paymentsContainer}>
      {/* <BackspaceButton to={`/course/my-enrollments`}/> */}
      <h2>Payment Details</h2>
        {/* <h3>Course ID: {enrollment.course}</h3> */}
        <table className={styles.paymentTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th className={styles.hideOnMobile}>Created At</th>
              <th className={styles.hideOnMobile}>Updated At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {enrollment.orderIds.map((order) => (
              <tr key={order._id}>
                <td className={styles.orderIdCell} title={order.orderId}>
                  {order.orderId}
                </td>
                <td
                  className={
                    order.status === "accepted"
                      ? styles.statusAccepted
                      : order.status === "refunded"
                      ? styles.statusRefunded
                      : styles.statusCreated
                  }
                >
                  {order.status}
                </td>
                <td className={styles.hideOnMobile}>
                  <span className={styles.timestamp}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className={styles.hideOnMobile}>
                  <span className={styles.timestamp}>
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => recheckStatus(order.orderId)}
                    className={styles.recheckBtn}
                  >
                    Recheck
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default Payments;
