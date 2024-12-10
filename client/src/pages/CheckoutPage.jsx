import React, { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInPesos } from '../utils/DisplayPriceInPesos'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem,fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()

  const handleCashOnDelivery = async() => {
      try {
          const response = await Axios({
            ...SummaryApi.CashOnDeliveryOrder,
            data : {
              list_items : cartItemsList,
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : totalPrice,
              totalAmt :  totalPrice,
            }
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              if(fetchOrder){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      }
  }

  const handleOnlinePayment = async () => {
    try {
        // Display a loading message (optional)
        toast.loading("Redirecting to GCash...");

        // GCash QR Code URL
        const qrCodeLink = "https://res.cloudinary.com/dax4jdd8g/image/upload/v1733846218/j2brcqpra7wdi7n6iiqh.jpg";

        // Send payment information to the server (MongoDB integration)
        const response = await Axios({
          ...SummaryApi.payment_url,
          data: {
              list_items: cartItemsList,
              addressId: addressList[selectAddress]?._id,
              subTotalAmt: totalPrice,
              totalAmt: totalPrice,
          },
      });

      // Check if the response was successful
      const { data: responseData } = response;
      if (responseData?.success) {
          toast.dismiss(); // Dismiss the loading toast
          toast.success("Payment information saved! Redirecting to GCash...");

          // Redirect to the GCash QR code link
          window.open(qrCodeLink, "_blank"); // Opens the QR code in a new tab

          // Fetch updated cart and order data (optional)
          if (fetchCartItem) fetchCartItem();
          if (fetchOrder) fetchOrder();
      } else {
          throw new Error("Failed to save payment information. Please try again.");
      }
  } catch (error) {
      // Handle errors gracefully
      toast.dismiss(); // Dismiss the loading toast
      AxiosToastError(error);
      console.error("Error during payment:", error);
  }
  }

  //const handleOnlinePayment = async()=>{
  //  try {
  //      toast.loading("Loading...")
  //      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  //      const stripePromise = await loadStripe(stripePublicKey)
  //     
  //      const response = await Axios({
  //          ...SummaryApi.payment_url,
  //          data : {
  //            list_items : cartItemsList,
  //            addressId : addressList[selectAddress]?._id,
  //            subTotalAmt : totalPrice,
  //            totalAmt :  totalPrice,
  //          }
  //      })
//
  //      const { data : responseData } = response
//
  //      stripePromise.redirectToCheckout({ sessionId : responseData.id })
  //      
  //      if(fetchCartItem){
  //        fetchCartItem()
  //      }
  //      if(fetchOrder){
  //        fetchOrder()
  //      }
  //  } catch (error) {
  //      AxiosToastError(error)
  //  }
  //}
  return (
    <section className='bg-black'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        <div className='w-full'>
          {/***address***/}
          <h3 className='text-lg font-semibold'>Choose your address</h3>
          <div className='bg-black p-2 grid gap-4'>
            {
              addressList.map((address, index) => {
                return (
                  <label htmlFor={"address" + index} className={!address.status && "hidden"}>
                    <div className='border rounded p-3 flex gap-3 hover:bg-black'>
                      <div>
                        <input id={"address" + index} type='radio' value={index} onChange={(e) => setSelectAddress(e.target.value)} name='address' />
                      </div>
                      <div>
                        <p>{address.address_line}</p>
                        <p>{address.city}</p>
                        <p>{address.state}</p>
                        <p>{address.country} - {address.pincode}</p>
                        <p>{address.mobile}</p>
                      </div>
                    </div>
                  </label>
                )
              })
            }
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-black border-2 border-dashed flex justify-center items-center cursor-pointer'>
              Add address
            </div>
          </div>



        </div>

        <div className='w-full max-w-md bg-black py-4 px-2'>
          {/**summary**/}
          <h3 className='text-lg font-semibold'>Summary</h3>
          <div className='bg-black p-4'>
            <h3 className='font-semibold'>Bill details</h3>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Items total</p>
              <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInPesos(notDiscountTotalPrice)}</span><span>{DisplayPriceInPesos(totalPrice)}</span></p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Quntity total</p>
              <p className='flex items-center gap-2'>{totalQty} item</p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Delivery Charge</p>
              <p className='flex items-center gap-2'>Free</p>
            </div>
            <div className='font-semibold flex items-center justify-between gap-4'>
              <p >Grand total</p>
              <p>{DisplayPriceInPesos(totalPrice)}</p>
            </div>
          </div>
          <div className='w-full flex flex-col gap-4'>
            <button className='py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white font-semibold' onClick={handleOnlinePayment}>Online Payment</button>

            <button className='py-2 px-4 border-2 border-red-600 font-semibold text-red-600 hover:bg-red-600 hover:text-white' onClick={handleCashOnDelivery}>Cash on Delivery</button>
          </div>
        </div>
      </div>


      {
        openAddress && (
          <AddAddress close={() => setOpenAddress(false)} />
        )
      }
    </section>
  )
}

export default CheckoutPage
