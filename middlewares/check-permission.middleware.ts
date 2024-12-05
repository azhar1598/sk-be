import UnauthorizedException from "@exceptions/unauthorized.exception";
import { NextFunction, Request, Response } from "express";

export const checkPermission = async (req:Request, res: Response, next: NextFunction) =>{
  try {

    if(!req.user) throw new UnauthorizedException("Forbidden", req.requestId, 403);
    
    

  
    next();
  } catch (error) {
    throw new UnauthorizedException("Forbidden", req.requestId, 403);
  }
}

