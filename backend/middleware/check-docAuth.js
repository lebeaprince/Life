const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

module.exports =(req,res,next) =>{
  try{
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, jwtSecret);
    next();
  }catch(error){
    res.status(401).json({message: "Auth failed!"})
  }
}
