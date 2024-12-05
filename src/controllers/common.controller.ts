import { Request, Response } from "express";

const CommonController = {
  index: async (req: Request, res: Response) => {
    return res.send("ss");
  },
};

export default CommonController;
