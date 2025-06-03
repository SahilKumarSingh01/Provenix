const razorpay = require('../config/razorpay'); // adjust path to where you init Razorpay
const User = require("../models/User");

const create = async (req, res) => {
  try {
    const { name, phone,address,account_number,ifsc_code} = req.body;

    const user = await User.findById(req.user.id);

    if (!user.verifiedEmail)
      return res.status(400).json({ message: "Email address is missing or has not been verified." });
    if(user.accountId)
      return res.status(400).json({message:"You already have account"});

    payload={
      email:user.email,
      phone,
      type:"route",
      legal_business_name:name,
      business_type:"proprietorship",
      contact_name:user.displayName,
    
      profile:{
        category:'education',
        subcategory:'elearning',
        addresses:{
          registered:address,
        }
      },
    }

    const account = await razorpay.accounts.create(payload);
    

    const [stakeholder, product, updatedUser] = await Promise.all([
      razorpay.stakeholders.create(account.id, {
        name,
        email: user.email,
        phone: {
          primary: phone,
        },
      }),
      razorpay.products.requestProductConfiguration(account.id, {
        product_name: "route",
        // tnc_accepted: true,
      }),
      User.findByIdAndUpdate(req.user.id, {
        accountId: account.id,
      }),
    ]);
    
    const updatedProduct=await razorpay.products.edit(account.id,product.id,{
      settlements:{
          account_number,
          ifsc_code,
          beneficiary_name:name,
      },
    });
    
    const settlements=product.active_configuration.settlements;

    return res.status(201).json({
      success: true,
      message: 'Razorpay account created successfully',
      name:settlements.beneficiary_name,
      account_number:settlements.account_number,
      ifsc_code:settlements.ifsc_code,    
      address:account.profile.addresses.registered, 
      phone:account.phone.slice(-10),
      accountId:account.id,
      productId:product.id,
      status:user.activatedAccount?"Activated":"Deactivated",
    });

  } catch (error) {
    console.error('Razorpay SDK error:', error);
    return res.status(error.statusCode).json({
      success: false,
      message: error.error.description,
      error: error.message || error.toString()
    });
  }
};
// const update=async(req,res)=>{
//   try{
//     const { name, phone,address,account_number,ifsc_code} = req.body;

//     const user = await User.findById(req.user.id);

//     if(!user.accountId)
//       return res.status(400).json({message:"You don't have account"});
    
//     payload={
//       phone,
//       legal_business_name:name,
//       profile:{
//         addresses:{
//           registered:address,
//         }
//       },
//     }

//     const account = await razorpay.accounts.edit(user.accountId,payload);
//     console.log(account);

//     const [ product, updatedUser] = await Promise.all([
//       razorpay.products.requestProductConfiguration(account.id, {
//         product_name: "route",
//       }),
//       User.findByIdAndUpdate(req.user.id, {
//         activatedAccount: false,
//       }),
//     ]);
    
//     const updatedProduct=await razorpay.products.edit(account.id,product.id,{
//       settlements:{
//           account_number,
//           ifsc_code,
//           beneficiary_name:name,
//       },
//     });
    
//     const settlements=product.active_configuration.settlements;

//     return res.status(201).json({
//       success: true,
//       message: 'Razorpay account updated successfully',
//       name:settlements.beneficiary_name,
//       account_number:settlements.account_number,
//       ifsc_code:settlements.ifsc_code,    
//       address:account.profile.addresses.registered, 
//       phone:account.phone.slice(-10),
//       accountId:account.id,
//       productId:product.id,
//       status:"Deactivated",
//     });
//   }catch (error) {
//     console.error('Razorpay SDK error:', error);
//     return res.status(error.statusCode).json({
//       success: false,
//       message: error.error.description,
//       error: error.message || error.toString()
//     });
//   }
// }
const activate = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.accountId) {
      return res.status(400).json({ message: "You don't have an account to activate." });
    }

    const product = await razorpay.products.requestProductConfiguration(user.accountId, {
      product_name: "route",
    });

    if (product.activation_status !== "activated") {
      return res.status(400).json({
        message: `Product not activated. Current status: ${product.activation_status}`,
        activation_status: product.activation_status,
      });
    }

    // Update status using updateOne to avoid overwriting the user doc unintentionally
    await User.updateOne(
      { _id: req.user.id },
      { status: "Activated" }
    );

    return res.status(200).json({
      message: "Razorpay account successfully activated!",
      status: "Activated",
    });
  } catch (err) {
    console.error("Activation error:", err);
    return res.status(500).json({ message: "Something went wrong during activation." });
  }
};
const deactivate =async (req,res)=>{

  try{
    const user=await User.findById(req.user.id);
    if (!user.accountId) {
      return res.status(400).json({ message: "You don't have an account to delete." });
    }
    await User.findByIdAndUpdate(req.user.id,{activatedAccount:false});
    res.status(204).json({message:"Your account has beed deactivated ",status:"Deactivated"});

  }catch(err){
    return res.status(500).json({message:"Fail to deactivate your account "});
  }
}
const get=async(req,res)=>{
    try{
        const user=await User.findById(req.user.id);
        if(!user.accountId)
            return res.status(400).json({message:"you don't have razorpay account yet"});
        const account=await razorpay.accounts.fetch(user.accountId);
        const product=await razorpay.products.requestProductConfiguration(user.accountId,{product_name:"route"});

        const settlements=product.active_configuration.settlements;
        res.status(200).json({
            name:settlements.beneficiary_name,
            account_number:settlements.account_number,
            ifsc_code:settlements.ifsc_code,    
            address:account.profile.addresses.registered, 
            phone:account.phone.slice(-10),
            accountId:account.id,
            productId:product.id,
            status:user.activatedAccount?"Activated":"Deactivated",
        });
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Error"});
    }
}
module.exports = {
    create,
    get,
    activate,
    deactivate,
};
