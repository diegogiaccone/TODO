import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcryptjs';
import config from './config/config.env.js';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { transport } from "./config/mail.config.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 


export const recoverPass = (date, code) => {
  return transport.sendMail({
      from: 'TODO <diegogiaccone35@gmail.com>',
      to: date,
      subject: 'Reestablece tu contraseña',
      html: `
          <h1><b>Si ud no ha solicitado el reestablecimiento de su contraseña ignore este mail</b></h1>
          <h1><b>Click en el siguiente enlace para reestablecer la contraseña</b></h1>
          <a href="http://localhost:3030/recoverypass/${code}" class="btn btn-primary git">http://localhost:3030/recoverypass/${code}</a>       
      `        
  })}


export const upload = multer()

export const generateTokenpass = () => {
  const token = randomBytes(32).toString('hex'); 
  
  const signedToken = jwt.sign(
    { token: token },
    config.SECRET, // Aquí debería ser una clave secreta más segura
    { expiresIn: '1h' }
  );
  
  return signedToken;
};

                
const createHash = (pass) => {
    return bcrypt.hash(pass, bcrypt.genSaltSync(10));
}

const isValidPassword = (passInDb, passToCompare) => {
    return bcrypt.compare(passToCompare, passInDb);
}

export { __filename, __dirname, createHash, isValidPassword };