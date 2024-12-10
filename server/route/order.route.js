import { Router } from 'express';
import auth from '../middleware/auth.js';
import { 
    CashOnDeliveryOrderController, 
    getOrderDetailsController, 
    paymentController 
} from '../controllers/order.controller.js';

const orderRouter = Router();

// Endpoint for cash-on-delivery orders
orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController);

// Endpoint for online payments (e.g., GCash)
orderRouter.post('/checkout', auth, paymentController);

// Endpoint to get the order list
orderRouter.get("/order-list", auth, getOrderDetailsController);

export default orderRouter;
