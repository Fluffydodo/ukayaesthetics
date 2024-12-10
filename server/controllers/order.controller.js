import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

// Cash On Delivery Order Controller
export async function CashOnDeliveryOrderController(request, response) {
    try {
        const userId = request.userId; // Auth middleware
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        const payload = list_items.map((el) => ({
            userId: userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            productId: el.productId._id,
            product_details: {
                name: el.productId.name,
                image: el.productId.image,
            },
            paymentId: "",
            payment_status: "CASH ON DELIVERY",
            delivery_address: addressId,
            subTotalAmt: subTotalAmt,
            totalAmt: totalAmt,
        }));

        const generatedOrder = await OrderModel.insertMany(payload);

        // Remove items from the cart
        await CartProductModel.deleteMany({ userId: userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        return response.json({
            message: "Order successfully placed",
            error: false,
            success: true,
            data: generatedOrder,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

// Price Calculation with Discount
export const priceWithDiscount = (price, discount = 1) => {
    const discountAmount = Math.ceil((Number(price) * Number(discount)) / 100);
    return Number(price) - Number(discountAmount);
};

// Payment Controller (for GCash or manual integrations)
export async function paymentController(request, response) {
    try {
        const userId = request.userId; // Auth middleware
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        const payload = list_items.map((el) => ({
            userId: userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            productId: el.productId._id,
            product_details: {
                name: el.productId.name,
                image: el.productId.image,
            },
            paymentId: "GCASH",
            payment_status: "PENDING",
            delivery_address: addressId,
            subTotalAmt: subTotalAmt,
            totalAmt: totalAmt,
        }));

        const generatedOrder = await OrderModel.insertMany(payload);

        // Remove items from the cart
        await CartProductModel.deleteMany({ userId: userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        return response.json({
            message: "Payment recorded and order created",
            success: true,
            error: false,
            data: generatedOrder,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

// Get Order Details Controller
export async function getOrderDetailsController(request, response) {
    try {
        const userId = request.userId;

        const orderList = await OrderModel.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate("delivery_address");

        return response.json({
            message: "Order list retrieved",
            data: orderList,
            error: false,
            success: true,
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}
