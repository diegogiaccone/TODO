import { Router } from "express";
import Rol from "../services/isAdmin.dbclass.js";
import { authentication } from "../auth/passport.jwt.js";
import { authorization } from "../auth/passport.jwt.js";
import { upload } from "../utils.js";
import { addProduct, deleteProduct, getProducts, getProductsIndex, getUpdate, updateProduct, validate, getErrOwner, getErrAddOwner, getAddProduct } from "../controller/products.controller.js";


const router = Router();
const rol = new Rol();

const productRoutes = (io) => {    

    router.get(`/update`, getUpdate, [validate, authentication('jwtAuth') ])

    router.get('/products_index', getProductsIndex, [validate, authentication('jwtAuth')]);

    router.get('/addProduct', getAddProduct, [validate, authentication('jwtAuth')]);

    router.get('/products', getProducts, [validate, authentication('jwtAuth')]);
    
    router.get(`/errorOwner`, getErrOwner, [validate, authentication('jwtAuth')])

    router.get(`/errAddOwner`, getErrAddOwner, [validate, authentication('jwtAuth')])
    
    router.post('/products_index', upload.single('thumbnail'), addProduct, [validate, authentication('jwtAuth')]);
    
    router.put('/products_index:pid', updateProduct, [validate, authentication('jwtAuth')]);
    
    router.delete('/products_index:id', deleteProduct, [validate, authentication('jwtAuth')]);

    return router;
}

export default productRoutes;