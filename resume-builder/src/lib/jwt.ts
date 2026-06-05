import { JWTPayload } from "@/types/user.types";
import jwt from "jsonwebtoken";

export const generateToken = (payload: JWTPayload) : string => {
    return jwt.sign(payload, process.env.JWT_SECRET!, { 
        expiresIn: '7d'
     })
}

export const verifyToken = (token: string) : JWTPayload => {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
}