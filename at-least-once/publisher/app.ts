

import { NextFunction, Request, Response } from "express";
import express from 'express';
import { AddressInfo } from 'net';
import { createServer } from 'http';
import { connectRabbitMQ, publishLog } from "./rabbit";

const app = express();

app.use(express.static('public'));

app.use('/', (req: Request, res:Response, next: NextFunction) => {
    next();
});

app.get("/alo/publish", async (req: Request, res: Response) => {
    const r = await publishLog({
        test: "At least once",
        timestamp: Date.now()
    })

    return res.json(r)
});

connectRabbitMQ();

const httpServer = createServer(app);

const server = httpServer.listen(process.env.ALO_PUB_PORT || 8001, () => {
    let binding: string | number | AddressInfo | null;
    if(typeof server.address() === 'string'){
        binding = server.address();
    }else{
        let addr = server.address() as AddressInfo;
        binding = addr.port;
    }
    console.log(`Listening Backend API on port ${binding}`);
});

// console.log(require('crypto').randomBytes(64).toString('hex'));