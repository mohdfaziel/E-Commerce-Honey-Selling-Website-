import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import fadeIn from "../../../Framer/Fadein.js";
import databaseService from "../../../Firebase/Services/database";
import { clearOrder } from "../../../Store/OrderDetails/OrderSlice";
import { clearCart } from "../../../Store/Cart/CartSlice";
import { reStock } from "../../../Store/Honey/HoneySlice";
import toast from "react-hot-toast";
import paymentHandler from "../../../RazorpayPG/paymentHandler";
import { sendOrderConfirmation } from "../../../Mailer/EmailSenderUser";
import { newOrder } from "../../../Mailer/EmailSenderAdmin";

function Pay() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const honeyInStock = useSelector((state) => state.honey.qtyAvailable);
  const userDetails = useSelector((state) => state.user.userData);
  const orderDetails = useSelector((state) => state.order.orderDetails);
  const items = useSelector((state) => state.cart.items || []);
  const totalHoney = useSelector((state) => state.cart.totalWeight);
  const totalCost = useSelector((state) => state.cart.total);

  async function placeOrder(e) {
    e.preventDefault();
    document.body.style.cursor = 'wait';
    setTimeout(() => {
      document.body.style.cursor = 'default';
    }, 5000);
    const orderId = `ORD-${Date.now()}`;
    const initialOrderData = {
      orderId,
      userName: userDetails.name,
      userEmail: userDetails.email,
      userPhone: orderDetails.phone,
      houseNo: orderDetails.houseNo,
      area: orderDetails.area,
      pincode: orderDetails.pincode,
      district: orderDetails.district,
      shippingCost: orderDetails.shippingCost,
      state: orderDetails.state,
      totalprice: totalCost,
      quantity: totalHoney,
      halfKgJars: items.find((item) => item.id === 1)?.qty || 0,
      oneKgJars: items.find((item) => item.id === 2)?.qty || 0,
      twoKgJars: items.find((item) => item.id === 3)?.qty || 0,
      paymentStatus: "Pending",
    };

    setOrderInfo(initialOrderData);

    try {
      const updatedOrderData = await paymentHandler(
        initialOrderData,
        setOrderInfo,
        navigate
      );
      console.log("Payment data",updatedOrderData);
      if (!updatedOrderData) {
        console.error(
          "Payment processing failed, received undefined order data."
        );
        return;
      }
      if (updatedOrderData?.paymentStatus === "Paid") {
        const result = await databaseService.placeOrder(
          userDetails.uid,
          updatedOrderData
        );
        if (result.success) {
          sendOrderConfirmation(updatedOrderData);
          newOrder(updatedOrderData);
          const remHoney = honeyInStock - totalHoney;
          await databaseService.updateProductStock(remHoney);
          dispatch(reStock(remHoney));
          dispatch(clearOrder());
          dispatch(clearCart());
          toast.success("Order placed successfully!");
          await new Promise((resolve) => setTimeout(resolve, 1));
          navigate("/myOrders/" + result.orderId);
        } else {
          toast.error("Failed to save order. Please contact support.");
        }
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error in payment process:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }
  return (
    <motion.div   variants={fadeIn("", 0.5)}
    initial="hidden"
    whileInView={"show"}
    viewport={{ once: false, amount: 0.1 }}  className="w-full p-2 md:p-4 flex flex-col transition-all gap-2 rounded-2xl md:rounded-2xl border-[2px] text-sm font-bold border-gray-300 shadow-sm">
      <label className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className="w-4 h-4 accent-main cursor-pointer"
        />
        <div>I accept the
        <span onClick={()=>navigate("/policies")} className="text-blue-600 cursor-pointer transition-all"> Terms </span>
        and
        <span onClick={()=>navigate("/policies")} className="text-blue-600 cursor-pointer transition-all"> Privacy Policy</span></div>
      </label>
      <button
        className={`w-full py-2 text-white font-semibold rounded-lg transition-all bg-blue-600 ${
          isChecked ? "opacity-100" : "opacity-50 cursor-not-allowed"
        }`}
        onClick={placeOrder}
        disabled={!isChecked}
      >
        Pay Now
      </button>
    </motion.div>
  );
}

export default Pay;
