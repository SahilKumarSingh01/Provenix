import { useState, useEffect } from "react";
import axios from "../api/axios";
import styles from "../styles/RazorpayAccountForm.module.css";
import countries from "../contents/countries.js";
import BackspaceButton from "../components/BackspaceButton.jsx"
import ConfirmBox from "../components/ConfirmBox.jsx";

const RazorpayAccountForm = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ifsc_code, setIfscCode] = useState("");
  const [account_number, setAccountNumber] = useState("");
  const [accountId, setAccountId] = useState("");
  const [productId, setProductId] = useState("");
  const [status, setStatus] = useState(""); // internal, not shown

  const [address, setAddress] = useState({
    street1: "",
    street2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "IN",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [overlay,setOverlay]=useState(null);
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        setSuccess("Loading...");
        const response = await axios.get("/api/profile/get-razorpay-account");
        const data = response.data;

        setName(data.name);
        setPhone(data.phone);
        setIfscCode(data.ifsc_code);
        setAccountNumber(data.account_number);
        setAddress(data.address || {});
        setAccountId(data.accountId || "");
        setProductId(data.productId || "");
        setStatus(data.status || "");
      } catch (err) {
        console.log(err);
      }finally{
        setLoading(false);
        setSuccess("");
      }
    };
    fetchAccount();
  }, []);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleActivate=async (e)=>{
    setError("");
    setSuccess("Activating...");
    try{
      const response = await axios.put("/api/profile/activate-razorpay-account");
      setStatus(response.data.status)
      setSuccess("Your account activated successfully");
    }catch(err){
      setError(err?.response?.data?.message || "Oops! Something went wrong.");
    }finally{
      setSuccess("");
    }
  }
  const handleDeactivate=async (e)=>{
    
    const onConfirm = async () => {
            setError("");
            setSuccess("Deactivating...");
            try{
              const response = await axios.put("/api/profile/deactivate-razorpay-account");
              setSuccess("Your account deactivated successfully ");
              setStatus( response.data.status);
            }catch(err){
              setError(err?.response?.data?.message || "Oops! Something went wrong.");
            }finally{
              setSuccess("");
              setOverlay(null);
            }
          };
        
          setOverlay(
            <ConfirmBox
              onConfirm={onConfirm}
              onCancel={() => setOverlay(null)}
              message={`Deactivating your Razorpay account will deactivate your payout channel.
                        You will no longer be able to receive payments from your course sales. All future payouts will be redirected to Provenix's default account.

                        Are you sure you want to proceed with deactivating your Razorpay account?`}
            />
          );
  }
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name ||!phone ||!ifsc_code ||!account_number ||!address.street1 ||!address.city ||!address.state ||!address.postal_code) {
      setError("Please fill all required fields!");
      return;
    }
    
    const onConfirm = async () => {
      setLoading(true);
      setSuccess("Creating...");

      try {
        const response = await axios.post("/api/profile/create-razorpay-account", {name,phone,ifsc_code,account_number,address,});
        setStatus(response.data.status);
        setAccountId(response.data.accountId);
        setProductId(response.data.productId);
        setSuccess("Razorpay account created successfully!");
      } catch (err) {
        setError(err?.response?.data?.message || "Oops! Something went wrong.");
      }
      setLoading(false);
      setSuccess("");
      setOverlay(null);

    
    };

    setOverlay(
      <ConfirmBox
        onConfirm={onConfirm}
        onCancel={() => setOverlay(null)}
        message={`Please check your details carefully. **Changes are not permitted once the account is created.**
           If anything is wrong, you will need to contact our technical support team to get it rectified.`}
      />
    );
  };

  return (
    <>
    <BackspaceButton to={`/edit-profile`}/>
    {overlay}
    <div className={styles.container}>
      <h2 className={styles.formHeading}>Razorpay Account Form</h2>

      <form  onSubmit={handleCreate} className={styles.form}>
        <h3 className={styles.sectionTitle}>Bank Account Details</h3>

        <div className={styles.formGroup}>
          <label>Account Holder Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
        </div>

        <div className={styles.formGoupWrapper}>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>IFSC Code</label>
            <input
              type="text"
              value={ifsc_code}
              onChange={(e) => setIfscCode(e.target.value)}
              placeholder="IFSC Code"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Account Number</label>
            <input
              type="text"
              value={account_number}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Account Number"
              required
            />
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Registered Address</h3>

        <div className={styles.formGroup}>
          <label>Country</label>
          <select
            name="country"
            value={address.country}
            onChange={handleAddressChange}
            required
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Street 1</label>
          <input
            type="text"
            name="street1"
            value={address.street1}
            onChange={handleAddressChange}
            placeholder="Street 1"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Street 2</label>
          <input
            type="text"
            name="street2"
            value={address.street2}
            onChange={handleAddressChange}
            placeholder="Street 2"
          />
        </div>

        <div className={styles.formGoupWrapper}>
          <div className={styles.formGroup}>
            <label>City</label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleAddressChange}
              placeholder="City"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>State</label>
            <input
              type="text"
              name="state"
              value={address.state}
              onChange={handleAddressChange}
              placeholder="State"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Postal Code</label>
            <input
              type="text"
              name="postal_code"
              value={address.postal_code}
              onChange={handleAddressChange}
              placeholder="Postal Code"
              required
            />
          </div>
        </div>

        {/* New Read-Only Fields Section */}
        <h3 className={styles.sectionTitle}>Linked Metadata</h3>
        <div className={styles.formGoupWrapper}>
          <div className={styles.formGroup}>
            <label>Status</label>
            <input type="text" value={status} readOnly />
          </div>

          <div className={styles.formGroup}>
            <label>Account ID</label>
            <input type="text" value={accountId} readOnly />
          </div>

          <div className={styles.formGroup}>
            <label>Product ID</label>
            <input type="text" value={productId} readOnly />
          </div>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}
          <div className={styles.actionGroup}>
            {accountId?
                status!="Activated"?
                    <button type="button" className={styles.actionButton} onClick={handleActivate}>
                        Activate
                    </button>
                  : <button type="button" className={styles.deleteBtn} disabled={status!="Activated"} onClick={handleDeactivate}>
                      Deactivate
                    </button>
            :
              <button type="submit" className={styles.actionButton} disabled={loading} >
                Create Account
              </button>
            }
          </div>
      </form>
    </div>
    </>
  );
};

export default RazorpayAccountForm;
