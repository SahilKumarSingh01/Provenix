import { useEffect, useState ,useContext} from 'react';
import { toast } from 'react-toastify';
import BackspaceButton from "../components/BackspaceButton.jsx"
import axios from '../api/axios.js';

import { useSearchParams ,useLocation} from 'react-router-dom';
import { AuthContext } from "../context/AuthContext.jsx";
import { useCache } from "../context/CacheContext.jsx";

import styles from '../styles/RazorpayOrder.module.css';

// Make sure your .env file has VITE_RAZORPAY_KEY_ID
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Function to dynamically load the Razorpay SDK script
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function RazorpayOrder() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading payment gateway...');
  const [error, setError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const location=useLocation();
  const [searchParams] = useSearchParams();
  const { getCache,setCache}=useCache();
  
  const {course,order}=location.state;
  const { user } = useContext(AuthContext);
  // Use useSearchParams to get query parameters from the URL
  
  const orderId = searchParams.get('orderId');
  const courseId= searchParams.get('courseId');
  const enrollmentId=searchParams.get('enrollmentId');
  const courseName = course?.title;

  useEffect(() => {
    // 1. Load Razorpay SDK script
    const initScript = async () => {
      const loaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
      if (loaded) {
        setRazorpayLoaded(true);
        setMessage('Razorpay SDK loaded. Preparing payment...');
      } else {
        const errMsg = 'Failed to load Razorpay SDK. Please check your internet connection.';
        setError(errMsg);
        setMessage('Payment failed.');
        toast.error(errMsg);
        // window.close();
      }
    };

    initScript();
  }, []);
  // console.log("lol look here",orderId);
  useEffect(() => {
    if (razorpayLoaded && orderId && !error) {
      const initiatePayment = () => {
        setMessage('Redirecting to payment...');
        const options = {
          key: RAZORPAY_KEY_ID,
          order_id: orderId,
          name: "Provenix",
          description: `Payment for ${courseName} subscription.`, // Generic description
          image: user?.photo, // Global app logo
          prefill: {
            name: user?.displayName || user?.username,
          },
          handler: async function (response) {
            setLoading(false);
            setMessage('Payment successful! Verifying...');
            try{
              const {data}=await axios.post(`api/enrollment/${enrollmentId}/verify-payment`,{orderId});
              toast.success(data.message);
              const course=getCache(courseId);
              if(course)
                course.isEnrolled=true;
              navigate(`/course/${courseId}/view`)
            }catch(err){
              toast.error(err.response.data?.message||"Fail to verify");
            }

            

            // window.close();
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              const dismissMsg = 'Payment was cancelled or dismissed.';
              setError(dismissMsg);
              setMessage('Payment cancelled.');
              toast.info(dismissMsg);
              // window.close();
            },
          },
        };
        // options.handler();
        const rzp = new window.Razorpay(options);
        rzp.open();
      };

      // Basic validation for critical data
      if (!RAZORPAY_KEY_ID) {
        const errMsg = "Razorpay Key ID is missing. Please check your environment variables.";
        setError(errMsg);
        setMessage("Payment failed.");
        toast.error(errMsg);
        // window.close();
        return;
      }
      if (!orderId) { // This should be caught by the initial check, but good to have
        const errMsg = "Order ID not found in URL. Cannot process payment.";
        setError(errMsg);
        setMessage("Payment failed.");
        toast.error(errMsg);
        // window.close();
        return;
      }

      initiatePayment();
    }
  }, [razorpayLoaded, orderId, error]); // Include razorpayOptionsData in dependencies

  // This initial check for orderId helps display a quick error if URL is malformed
  if (!orderId) {
      return (
          <div className={styles.razorpayContainer}>
            <BackspaceButton to={`/course/${courseId}/view`}/>
            
              <div className={styles.card}>
                  <h1 className={styles.title}>Payment Error</h1>
                  <p className={styles.errorMessageBlock} role="alert">
                      <strong>Error: </strong>
                      <span>Order ID is missing from the URL. Please ensure you clicked a valid payment link.</span>
                  </p>
                  <p className={styles.message}>This window will close automatically.</p>
              </div>
          </div>
      );
  }

  return (
    <div className={styles.razorpayContainer}>
      <BackspaceButton to={`/course/${courseId}/view`}/>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {loading ? 'Processing Payment...' : 'Payment Status'}
        </h1>
        {loading && (
          <div className={styles.spinner}></div>
        )}
        <p className={styles.message}>{message}</p>
        {error && (
          <div className={styles.errorMessageBlock} >
            <strong>Error: </strong>
            <span>{error}</span>
            <p className={styles.message}>Please try again from the main application window or contact support.</p>
          </div>
        )}
        {!loading && !error && (
          <p className={styles.successMessage}>
            Redirecting to payment gateway. Please wait...
          </p>
        )}
      </div>
    </div>
  );
}