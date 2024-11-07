import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();
const secret_key = process.env.secret_key;
const payloadData = process.env.payloadData;
export const generateToken =()=> {
// Set `noTimestamp` to true to exclude `iat`
//const options = { noTimestamp: true };
const tokenPayLoad = {service:payloadData};
const nonExpiryToken = jwt.sign(tokenPayLoad,secret_key);
console.log("Token : ",nonExpiryToken)
}

export const authenticateToken = (req,res,next)=>{
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if(!token)
        return res.status(401).json({message:'Token Required'});

    jwt.verify(token,secret_key,(err)=>{
        if(err) return res.status(403).json({message:'Invalid Token'});
        next();
    });

}