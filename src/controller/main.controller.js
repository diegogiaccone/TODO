import Users from '../services/user.dbclass.js';
import userModel from "../model/user.model.js";
import mongoose from 'mongoose';
import { store } from "../app.js";
import config from '../config/config.env.js';
import Products from '../services/products.dbclass.js';

const users = new Users();
const manager = new Products(); 
   
export const getProductsPaginated = async (req, res) => {   
       store.get(req.sessionID, async (err, data) => {
        if (err) console.log(`Error al recuperar datos de sesión (${err})`);
        if (data !== null && (req.session.userValidated || req.sessionStore.userValidated)) {           
            if (req.query.page === undefined) req.query.page = 0;    
            const result = await manager.getProductsPaginated(req.query.page * config.PRODUCTS_PER_PAGE, config.PRODUCTS_PER_PAGE);                                   
            const pagesArray = [];
            for (let i = 0; i < result.totalPages; i++) pagesArray.push({ index: i, indexPgBar: i});                
            const pagination = {                    
                baseUrl: `/`,
                limit: result.limit,
                offset: result.offset,
                totalPages: result.totalPages,
                totalDocs: result.totalDocs,
                page: result.page - 1,
                nextPageUrl: `/?page=${result.nextPage - 1}`,
                prevPageUrl: `/?page=${result.prevPage - 1}`,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                pagesArray: pagesArray
            }     
                     
            const userObjet = await userModel.findOne({user: req.session.user.user}).populate(`rol`)            
            const name = userObjet.name 
            const pass = userObjet.pass          
            const rol = userObjet.rol[0].name
            const isAdmin = rol === "Admin" ? true : false
            const isPremium = rol === "Premium" ? true : false
            const isUser = rol === "Usuario" ? true : false
            const avatar = userObjet.avatar            
            const existPass = pass === undefined ? false : true     
            res.render('products',{ products: result.docs, pagination: pagination, name:name, rol: rol, isAdmin: isAdmin, avatar: avatar, pass: existPass, isPremium: isPremium, isUser: isUser});
        } else {            
            res.render('login', {
                sessionInfo: req.session.userValidated !== undefined ? req.session : req.sessionStore                
            });
        }                    
    }); 
    };
    
export const logout = async (req, res) => {
    const user = req.session.user.user
    await userModel.updateOne({user:user}, {last_connection: new Date()})
    req.session.userValidated = req.sessionStore.userValidated = false;
    res.clearCookie('connect.sid',{domain:".localhost"});
    res.clearCookie('token', {domain: ".localhost"}) 
    req.session.destroy((err) => {
        req.sessionStore.destroy(req.sessionID, (err) => {
            if (err) console.log(`Error al destruir sesión (${err})`);
            console.log('Sesión destruída');
            res.redirect(`/`);
        });
    })
    };
    
export const login = users.validateUser; 


