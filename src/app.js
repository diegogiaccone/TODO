import express from 'express';
import MongoSingleton from './services/mongo.dbclass.js';
import productRoutes from './router/products.router.js';
import UserRoutes from './router/user.router.js';
import { __dirname} from './utils.js';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import { Server } from 'socket.io';
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mainRoutes from './router/main.router.js';
import createRol from './services/rol.dbclass.js';
import passport from 'passport';
import initializePassport from './auth/passport.config.js'
import sessionRoutes from './router/session.router.js'
import { initPassport } from './auth/passport.jwt.js';
import methodOverride from 'method-override';
import config from './config/config.env.js';
import multer from 'multer';
import path from "path"
import cors from "cors"


const PORT = config.PORT;
const MONGOOSE_URL = config.MONGOOSE_URL;
const SECRET = config.SECRET;
const PRODUCTS_PER_PAGE = config.PRODUCTS_PER_PAGE;
const wspuerto = config.WSPORT;
export const store = MongoStore.create({ mongoUrl: MONGOOSE_URL, mongoOptions: {}, ttl: 3600});


// Configuración de Multer para guardar archivos en la carpeta 'public'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'avatarFile') {
            cb(null, path.join(__dirname, 'public/profiles'));
        } else if (file.fieldname === 'thumbnailFile') {
            cb(null, path.join(__dirname, 'public/products'));
        } else if (file.fieldname === 'documents') {
            cb(null, path.join(__dirname, 'public/documents'));            
        } else {
            cb(new Error('Tipo de archivo no válido'), null);
        }
    }, 
    
    filename: function (req, file, cb) {        
      cb(null,file.originalname);
    }
  });
  
  export const upload = multer({ storage: storage });
  

  const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    optionsSuccessStatus: 204, 
    allowedHeaders: 'Content-Type,Authorization' 
  };
  
  
  const app = express();
    createRol();
    
    const httpServer = app.listen(wspuerto, () =>{
        console.log(`Servidor API/Socket.io iniciando en puerto ${wspuerto}`)    
    }) 
    
    
    const io = new Server(httpServer, { cors: { origin: "*", methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"], credentials: false }});
    
    // Parseo correcto de urls
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //cors
    app.use(cors(corsOptions))

    //metodo overRide
    app.use(methodOverride('_method'))
    
    //parseo de cookies
    app.use(cookieParser());
    
    //manejo de sesiones    
    app.use(session({
        store: store,
        secret: SECRET,
        resave: false,
        saveUninitialized: false
    }))

    //multer

    //sessiones de passport
    initializePassport();
    initPassport();
    app.use(passport.initialize());
    app.use(passport.session());   
    // end points    
    app.use('/', mainRoutes(io, store, PRODUCTS_PER_PAGE));
    app.use('/', UserRoutes(io));
    app.use('/api', productRoutes(io));
    app.use('/', sessionRoutes());


  
    
    // Plantillas estaticas
    app.use('/public', express.static(`${__dirname}/public`));
    
    // Motor de plantillas

    app.engine('handlebars', engine({
        handlebars:Handlebars,
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        helpers:{
            math: function(lvalue, operator, rvalue) {
                lvalue = parseFloat(lvalue);
                rvalue = parseFloat(rvalue);
                return {
                    "+": lvalue + rvalue,
                    "-": lvalue - rvalue,
                    "*": lvalue * rvalue,
                    "/": lvalue / rvalue,
                    "%": lvalue % rvalue
                }[operator];
            },
            or: function (condition1, condition2, options) {
                if (condition1 || condition2) {
                  return options.fn(this);
                } else {
                  return options.inverse(this);
                }
              }

        }
    }));


    // Configuración de Handlebars
    app.set('view engine', 'handlebars');
    app.set('views', `${__dirname}/views`);   

    //mongodb
    try {   
        MongoSingleton.getInstance()
        app.listen(PORT, () => {
            console.log(`Servidor iniciado en puerto ${PORT}`);
        });
    } catch(err) {
        console.log('No se puede conectar con el servidor de bbdd');
    }



