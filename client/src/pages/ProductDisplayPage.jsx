import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { FaAngleRight,FaAngleLeft } from "react-icons/fa6";
import { DisplayPriceInPesos } from '../utils/DisplayPriceInPesos'
import Divider from '../components/Divider'
import image1 from '../assets/minute_delivery.png'
import image2 from '../assets/Best_Prices_Offers.png'
import image3 from '../assets/Wide_Assortment.png'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from '../components/AddToCartButton'

const StarRating = ({ rating, setRating }) => (
  <div className="star-rating flex gap-2 text-lg">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => setRating(star)}
        style={{
          cursor: 'pointer',
          color: star <= rating ? 'gold' : 'gray',
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const ProductDisplayPage = () => {
  const params = useParams();
  let productId = params?.product?.split("-")?.slice(-1)[0];
  const [data, setData] = useState({
    name: '',
    image: [],
    ratings: [],
    averageRating: 0,
  });
  const [image, setImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(0); // User-selected rating
  const imageContainer = useRef();

  const fetchProductDetails = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    try {
      const { data: responseData } = await Axios.post(
        `/api/products/${productId}/rate`,
        { rating: userRating }
      );
      toast.success(responseData.message);
      setData((prev) => ({
        ...prev,
        ratings: responseData.ratings,
        averageRating: responseData.averageRating,
      }));
    } catch (error) {
      toast.error('Failed to submit rating.');
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [params]);

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 100;
  };
  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 100;
  };

  return (
    <section className="container mx-auto p-4 grid lg:grid-cols-2">
      <div>
        <div className="bg-black lg:min-h-[65vh] lg:max-h-[65vh] rounded min-h-56 max-h-56 h-full w-full">
          <img
            src={data.image[image]}
            className="w-full h-full object-scale-down"
            alt="Product"
          />
        </div>
        <div className="flex items-center justify-center gap-3 my-2">
          {data.image.map((img, index) => (
            <div
              key={img + index + "point"}
              className={`bg-slate-200 w-3 h-3 lg:w-5 lg:h-5 rounded-full ${
                index === image && 'bg-slate-300'
              }`}
            ></div>
          ))}
        </div>
        <div className="grid relative">
          <div
            ref={imageContainer}
            className="flex gap-4 z-10 relative w-full overflow-x-auto scrollbar-none"
          >
            {data.image.map((img, index) => (
              <div
                className="w-20 h-20 min-h-20 min-w-20 scr cursor-pointer shadow-md"
                key={img + index}
              >
                <img
                  src={img}
                  alt="min-product"
                  onClick={() => setImage(index)}
                  className="w-full h-full object-scale-down"
                />
              </div>
            ))}
          </div>
          <div className="w-full -ml-3 h-full hidden lg:flex justify-between absolute items-center">
            <button
              onClick={handleScrollLeft}
              className="z-10 bg-white relative p-1 rounded-full shadow-lg"
            >
              <FaAngleLeft />
            </button>
            <button
              onClick={handleScrollRight}
              className="z-10 bg-white relative p-1 rounded-full shadow-lg"
            >
              <FaAngleRight />
            </button>
          </div>
        </div>
        <div className="my-4">
          <h3 className="font-semibold">Ratings</h3>
          <p>Average Rating: {data.averageRating || 'No ratings yet'}</p>
          <StarRating rating={userRating} setRating={setUserRating} />
          <button
            onClick={submitRating}
            className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Submit Rating
          </button>
        </div>
      </div>

      <div className="p-4 lg:pl-7 text-base lg:text-lg">
        <p className="bg-red-300 w-fit px-2 rounded-full">10 Min</p>
        <h2 className="text-lg font-semibold lg:text-3xl">{data.name}</h2>
        <p>{data.unit}</p>
        <Divider />
        <div>
          <p>Price</p>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="border border-red-600 px-4 py-2 rounded bg-black w-fit">
              <p className="font-semibold text-lg lg:text-xl">
                {DisplayPriceInPesos(pricewithDiscount(data.price, data.discount))}
              </p>
            </div>
            {data.discount && (
              <>
                <p className="line-through">{DisplayPriceInPesos(data.price)}</p>
                <p className="font-bold text-red-600 lg:text-2xl">
                  {data.discount}%{' '}
                  <span className="text-base text-neutral-500">Discount</span>
                </p>
              </>
            )}
          </div>
        </div>

        {data.stock === 0 ? (
          <p className="text-lg text-red-500 my-2">Out of Stock</p>
        ) : (
          <div className="my-4">
            <AddToCartButton data={data} />
          </div>
        )}
        <h2 className="font-semibold">Why shop from Ukay Aesthetics? </h2>
        <div>
          {/* Additional sections */}
        </div>
      </div>
    </section>
  );
};

export default ProductDisplayPage
