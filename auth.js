const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const pool = require('./db.js'); 
const dotenv = require('dotenv'); 
dotenv.config(); 
const secretKey = process.env.SECRET_KEY;


const register = async (req, res) =>{
    const {username, password, sticker} = req.body; 
    const hashedPassword = await bcrypt.hash(password, 10); 
    
    pool.query('INSERT INTO users (username, password, point, sticker) VALUES ($1, $2, $3, $4)', [username, hashedPassword, 500, sticker], (err, result) =>{
        if (err){
            console.log(err.detail); 
            return res.status(500).json({error: err, 
                                        detail:err.detail
            }); 
        }
        console.log('register success'); 
        res.status(201).json({message: 'success', username}); 
    })
}

const login = async (req, res) => {
    const {username, password} = req.body; 
    // console.log(username, password);
    pool.query('SELECT * FROM users WHERE username = $1', [username], async (err, result) => {
        if (err || result.rows.length === 0) {
            return res.status(404).send({
                status: 'wrong infomation', 
                username: 'visitor'
            }); 
        }

        const user = result.rows[0];
        // console.log(user);  
        const isValidPassword = await bcrypt.compare(password, user.password); 
        
        if (isValidPassword)
        {
            const token = jwt.sign({userId:user.id, username:user.username}, secretKey, {expiresIn:'1h'}); 
            res.json({
                token, 
                username: user.username
            }); 
        }
        else
        {
            res.status(404).send({
                status:"error"
        }); 
        }


    })
}


const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({error:'access denied'}); 

    jwt.verify(token, secretKey, (err, user) => {
        if (err)
            return res.status(403).json({error: 'access denied'}); 
        
        req.user = user; 
        next(); 
    
    })
}


const findUserData  = async (req, res, next) => 
{
    const {username} = req.body; 
    pool.query('SELECT * FROM users WHERE username = $1', [username], async (err, result) => {
        if (err || result.rows.length === 0) {
            return res.status(404).send({
                status: 'wrong infomation', 
                username: 'visitor'
            }); 
        }

        const user = result.rows[0];
        
        res.json({
            user
        }); 

    })
}

module.exports = { register, login, authenticateToken, findUserData };
