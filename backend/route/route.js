import express from 'express';

// ==========================================
// Middleware Imports
// ==========================================
import { verifyToken } from '../middleware/verifyToken.js';
import { refreshToken } from '../middleware/refreshToken.js';
import isAdmin from '../middleware/isAdmin.js';
import isDellaer from '../middleware/isDellaer.js'; // Note: typo in original file name "isDellaer"
import { upload } from '../middleware/upload.js';
import { certificate } from '../middleware/certificatStorage.js';
import { apiLimiter } from '../middleware/loginLimitation.js';
import { validateImages, validatePdfs } from '../middleware/validateUploadedFiles.js';

// ==========================================
// Controller Imports
// ==========================================

// Auth Controllers
import { userRegisterController } from '../controllers/authController/userRegisterController.js';
import { userLoginController } from '../controllers/authController/userloginController.js';
import { userLogoutController } from '../controllers/authController/userlogOutController.js';
import { resetPasswordController } from '../controllers/authController/resetPasswordController.js';
import { verifyOtpController } from '../controllers/authController/verifyOtpController.js';
import { resendOtpController } from '../controllers/authController/resendOtpController.js';

// User & Cart Controllers
import { addToCartController } from '../controllers/userController/addToCartController.js';
import { getCartController } from '../controllers/userController/catController.js';
import { updateCartQuantityController } from '../controllers/userController/updateCartQuantityController.js';
import { removeCartItemController } from '../controllers/userController/removeFromCartController.js';
import { createOrderController } from '../controllers/userController/createOrderController.js';
import { getUserOrdersController } from '../controllers/userController/getUserOrdersController.js';
import { downloadInvoiceController } from '../controllers/userController/invoiceController.js';

// Admin Controllers
import { getAllUsersController } from '../controllers/adminControllers/getAllUsersController.js';
import { getAllOrdersController } from '../controllers/adminControllers/getAllOrdersController.js';
import { updateOrderStatusController } from '../controllers/adminControllers/updateOdersStatus.js';
import { getSingleOrderController } from '../controllers/adminControllers/getSingleOrderController.js';
import { addProductController } from '../controllers/adminControllers/addProductController.js';
import { updateProductController } from '../controllers/adminControllers/updateProductController.js';
import { deleteProductController } from '../controllers/adminControllers/deleteProductController.js';
import { suspendUserController } from '../controllers/adminControllers/suspendUserController.js';
import { unsuspendUserController } from '../controllers/adminControllers/unsuspendUserController.js';
import { getDashboardStatsController } from '../controllers/adminControllers/getDashboardStatsController.js';
import { getAllProducts } from '../controllers/adminControllers/getAllProductsController.js';
import   getAllShopRequests from '../controllers/adminControllers/getAllShopRequests.js';
import { updateshopStatus } from '../controllers/adminControllers/updateshopStatus.js';
import { addnewAdmin } from '../controllers/adminControllers/addnewAdmin.js';
import { getallAdmin } from '../controllers/adminControllers/getallAdmin.js';
import { allShops } from '../controllers/adminControllers/getallShops.js';

// Dealer Controllers
import { addProductDealerController } from '../controllers/dellarController/dellaerAddProduct.js';
import { createShopRequest } from '../controllers/dellarController/createShopeController.js';

import { verifyPaymentController } from '../controllers/Payment-controllers/verifyPaymentController.js';
import { initializePaymentController } from '../controllers/Payment-controllers/initializePaymentController.js';
import { webhookPaymentController } from '../controllers/Payment-controllers/webhookPaymentController.js';
// Router Initialization
// ==========================================
const router = express.Router();

// ------------------------------------------
// 1. Authentication Routes
// ------------------------------------------
router.post('/user-register', userRegisterController);
router.post('/verify-otp', verifyOtpController);
router.post('/resend-otp', resendOtpController);
router.post('/user-login', userLoginController);
router.post('/user-log-out', verifyToken, refreshToken, userLogoutController);
router.put('/user-reset-password', apiLimiter, verifyToken, refreshToken, resetPasswordController);

// ------------------------------------------
// 2. Shopping Cart & User Routes
// ------------------------------------------
router.get('/cart', verifyToken, refreshToken, getCartController);
router.post('/add-to-cart', verifyToken, refreshToken, addToCartController);
router.put('/update/:productId', verifyToken, refreshToken, updateCartQuantityController);
router.delete('/remove/:productId', verifyToken, refreshToken, removeCartItemController);

// ------------------------------------------
// 3. Order Routes
// ------------------------------------------
router.post('/create-order', verifyToken, refreshToken, createOrderController);
router.get('/my-orders', verifyToken, refreshToken, getUserOrdersController);
router.get('/orders/:id/invoice', verifyToken, refreshToken, downloadInvoiceController);

// ------------------------------------------
// 4. Public Product Routes
// ------------------------------------------
router.get('/get-All-product', getAllProducts);

// ------------------------------------------
// 5. Admin Routes
// ------------------------------------------
router.get('/get-all-users', verifyToken, refreshToken, isAdmin, getAllUsersController);
router.get('/get-all-orders', verifyToken, refreshToken, isAdmin, getAllOrdersController);
router.get('/orders/:id', verifyToken, refreshToken, isAdmin, getSingleOrderController);
router.get('/admin/orders/:id/invoice', verifyToken, refreshToken, isAdmin, downloadInvoiceController);
router.put('/update-orders/:id', verifyToken, refreshToken, isAdmin, updateOrderStatusController);

// Admin Product Management
router.post('/products', verifyToken, refreshToken, isAdmin, upload.array('images', 16), validateImages, addProductController);
router.put('/products-update/:id', verifyToken, refreshToken, isAdmin, upload.array('images', 6), validateImages, updateProductController);
router.delete('/products-delete/:id', verifyToken, refreshToken, isAdmin, deleteProductController);

// Admin User Status & Stats
router.put('/suspend-user/:id', verifyToken, refreshToken, isAdmin, suspendUserController);
router.put('/unsuspend-user/:id', verifyToken, refreshToken, isAdmin, unsuspendUserController);
router.get('/dashboard-stats', verifyToken, refreshToken, isAdmin, getDashboardStatsController);

// Admin Shop & Management
router.get('/get-shop-request', verifyToken, refreshToken, isAdmin, getAllShopRequests);
router.put('/update-shop-status', verifyToken, refreshToken, isAdmin, updateshopStatus);
router.get('/all-shops', verifyToken, refreshToken, isAdmin, allShops);
router.post('/add-new-admin', verifyToken, refreshToken, isAdmin, addnewAdmin);
router.post('/get-all-admin', verifyToken, refreshToken, isAdmin, getallAdmin);

// ------------------------------------------
// 6. Dealer Routes
// ------------------------------------------
router.post('/create-shop', apiLimiter, certificate.array('files', 3), validatePdfs, createShopRequest);
router.post('/dellaer-add-product', verifyToken, refreshToken, isDellaer, upload.array('images', 5), validateImages, addProductDealerController);

// ------------------------------------------
// 7. Payment Routes
// ------------------------------------------
router.post('/payment/initialize',initializePaymentController);
router.get('/verify-payment/:reference',verifyPaymentController);
router.post('/payment/webhook', webhookPaymentController);

export default router;