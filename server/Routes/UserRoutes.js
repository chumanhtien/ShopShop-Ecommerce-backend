import e from "express";
import express from "express";
import asyncHandler from "express-async-handler"
import protect from "../Middleware/AuthMiddleware.js";
import User from "../Models/UserModel.js";
import generateToken from "../utils/generateToken.js";

const userRouter = express.Router();

//LOGIN
userRouter.post(
    "/login",
    asyncHandler(async (req, res) => {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(user && await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
                createdAt: user.createdAt,
            });
        }
        // else {
        //     res.status(401);;
        //     throw new Error("Invalid Email or Password")
        // }
        else {
            res.status(401);
            if (!user) {
                throw new Error("Invalid Email");
            }
            else if (!await user.matchPassword(password)) {
                throw new Error("Wrong password")
            }
        }
    })
);

//REGISTER
userRouter.post(
    "/register",
    asyncHandler(async (req, res) => {
        const {name, email, password} = req.body;
        const userExist = await User.findOne({email});

        if(userExist) {
            res.status(400);
            throw new Error("User already exists");
        }
        
        const user = await User.create({
            name, 
            email, 
            password
        });

        if(user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email, 
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
                // createdAt: user.createdAt,
            })
        }
        else {
            res.status(400);
            throw new Error("Invalid USer Data")
        }
    })
);

//PROFILE
userRouter.get(
    "/profile",
    protect,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email, 
                isAdmin: user.isAdmin,
                // token: generateToken(user._id),
                createdAt: user.createdAt,
            })
        } else {
            res.status(404);
            throw Error("User not found")
        }
    })
);

export default userRouter;