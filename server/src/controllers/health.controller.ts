import type { Request, Response } from "express";

export const getHealth = (_request: Request, response: Response) => {
  response.json({
    status: "ok",
    service: "higher-lower-server",
    timestamp: new Date().toISOString()
  });
};

