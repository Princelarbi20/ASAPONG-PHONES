import express from 'express'
const router = express.Router()

import isAdmin from '../middleware/isAdmin.js'
import verifyToken from '../middleware/verifyToken.js'
import { upload } from '../middleware/upload.js'
import { certificate } from '../middleware/certificatStorage.js'
import { apiLimiter } from '../middleware/loginLimitation.js'
import { refreshToken } from '../middleware/refreshToken.js'
import isDellaer from '../middleware/isDellaer.js'
import { validateImages, validatePdfs } from '../middleware/validateUploadedFiles.js'
// User router endpoint Controllers
import { userRegisterController } from '../controllers/authController/userRegisterController.js'
import { userLoginController } from '../controllers/authController/userloginController.js'
import { userLogoutController } from '../controllers/authController/userlogOutController.js'
import { resetPasswordController } from '../controllers/authController/resetPasswordController.js'
import { addToCartController } from '../controllers/userController/addToCartController.js'
import { getCartController } from '../controllers/userController/catController.js'
import { updateCartQuantityController } from '../controllers/userController/updateCartQuantityController.js'
import { removeCartItemController } from '../controllers/userController/removeFromCartController.js'
import { createOrderController } from '../controllers/userController/createOrderController.js'
import { getUserOrdersController } from '../controllers/userController/getUserOrdersController.js'
// Auth & User routes
router.post('/user-register', apiLimiter, userRegisterController)
router.post('/user-login',  userLoginController)
router.post('/user-log-out', verifyToken, refreshToken, userLogoutController)
router.put('/user-reset-password', apiLimiter, verifyToken, refreshToken, resetPasswordController)

// Shopping Cart Core Routes
router.post("/add-to-cart",verifyToken,refreshToken,addToCartController);
router.get("/cart",verifyToken,refreshToken,getCartController);
router.get('//my-orders',verifyToken,refreshToken,getUserOrdersController);
router.put('/update/:productId', verifyToken, refreshToken, updateCartQuantityController);
router.delete('/remove/:productId',refreshToken, removeCartItemController);

// FIXED: Clean order creation mapping path matching frontend configurations parameters
router.post("/create-order", verifyToken, refreshToken, createOrderController);
router.get("/my-orders", verifyToken, refreshToken, getUserOrdersController)
// Admin controllers route imports
import { getAllOrdersController } from '../controllers/adminControllers/getAllOrdersController.js'
import { updateOrderStatusController } from '../controllers/adminControllers/updateOdersStatus.js'
import { addProductController } from '../controllers/adminControllers/addProductController.js'
import { updateProductController } from '../controllers/adminControllers/updateProductController.js'
import { deleteProductController } from '../controllers/adminControllers/deleteProductController.js'
import { suspendUserController } from '../controllers/adminControllers/suspendUserController.js'
import { unsuspendUserController } from '../controllers/adminControllers/unsuspendUserController.js'
import { getDashboardStatsController } from '../controllers/adminControllers/getDashboardStatsController.js'
import { getAllProducts } from '../controllers/adminControllers/getAllProductsController.js'
import { getAllUsersController } from '../controllers/adminControllers/getAllUsersController.js'
import getAllShopRequests from '../controllers/adminControllers/getAllShopRequests.js'
import { updateshopStatus } from '../controllers/adminControllers/updateshopStatus.js'
import { addnewAdmin } from '../controllers/adminControllers/addnewAdmin.js'
import { getallAdmin } from '../controllers/adminControllers/getallAdmin.js'
import { allShops } from '../controllers/adminControllers/getallShops.js'

// Admin dashboard access routes
router.get("/get-all-users", verifyToken, refreshToken, isAdmin, getAllUsersController);
router.get("/get-all-orders", verifyToken, refreshToken, isAdmin, getAllOrdersController);
router.put("/update-orders/:id", verifyToken, refreshToken, isAdmin, updateOrderStatusController);
router.post("/products", verifyToken, refreshToken, isAdmin, upload.array("images", 16), validateImages, addProductController);
router.put("/products-update/:id", verifyToken, refreshToken, isAdmin, upload.array("images", 6), validateImages, updateProductController);
router.delete("/products-delete/:id", verifyToken, refreshToken, isAdmin, deleteProductController);
router.put("/suspend-user/:id", verifyToken, refreshToken, isAdmin, suspendUserController);
router.put("/unsuspend-user/:id", verifyToken, refreshToken, isAdmin, unsuspendUserController);
router.get('/dashboard-stats', verifyToken, refreshToken, getDashboardStatsController);
router.get('/get-All-product', getAllProducts);
router.get('/get-shop-request', verifyToken, refreshToken, isAdmin, getAllShopRequests);
router.put('/update-shop-status', verifyToken, refreshToken, isAdmin, updateshopStatus);
router.post('/add-new-admin', verifyToken, refreshToken, isAdmin, addnewAdmin)
router.get("/all-shops", verifyToken, refreshToken, isAdmin, allShops)
router.post('/get-all-admin', verifyToken, refreshToken, isAdmin, getallAdmin)


// Dealer Controllers & routes
import { addProductDealerController } from '../controllers/dellarController/dellaerAddProduct.js'
import { createShopRequest } from '../controllers/dellarController/createShopeController.js'

router.post('/create-shop', apiLimiter, certificate.array('files', 3), validatePdfs, createShopRequest);
router.post('/dellaer-add-product', verifyToken, refreshToken, isDellaer, upload.array("images", 5), validateImages, addProductDealerController);

export default router
