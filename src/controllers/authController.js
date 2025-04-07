import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import User from '../models/user.js';

export const signin = async(req, res) => {
    try {
        const { username, password } = req.body;

        if(!username || !password) {
            return res.status(400).send({msg: 'Username or password missing'});
        }

        const user = await User.findOne({username});

        if(!user) {
            return res.status(400).send({msg: 'Username not found'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        const token = jwt.sign({user}, process.env.JWT_SECRET_KEY)
        res.cookie("token", token , {
            httpOnly: true,
            secure: true
            ,
            sameSite: 'Lax'
        })
        if(!isMatch){
            res.status(400).send({msg: "invalid username password"});
            return;
        }
        return res.status(201).send(user);

    } catch (err) {
        console.log('error while loggin in', err);
        res.status(400).send({err: err})
    }
}



export const signup = async(req, res) => {
    try {
        const { username, password } = req.body;

        if(!username || !password) {
            return res.status(400).send({msg: 'Username or password missing'});
        }

        const user = await User.findOne({username});

        if(user) {
            return res.status(400).send({msg: 'Username already exits'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResponse = await User.insertOne({username, password: hashedPassword})

        res.status(201).send(userResponse);
    } catch (err) {
        console.log('error while loggin in', err);
        res.status(400).send({err: err})
    }
}

export const verify = async (req, res) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) {
      return res.status(401).send({ msg: 'No token found' });
    }

    const token = cookie
      .split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return res.status(401).send({ msg: 'Token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY);

    return res.status(200).send({ msg: 'Verified' });
  } catch (err) {
    console.error(err);
    return res.status(401).send({ msg: 'Invalid or expired token' });
  }
};

export const signout = async(req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).send({})
    } catch (err) {
        res.status(400).send(err);
    }
}
