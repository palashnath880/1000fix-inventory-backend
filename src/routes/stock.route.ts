import { Router } from "express";
import stockController from "../controllers/stock.controller";

const stockRouter = Router();

// entry route
stockRouter.post(`/entry`, stockController.entry);

// get entry list route
stockRouter.get(`/entry`, stockController.entryList);

// own stock roue
stockRouter.get(`/own`, stockController.ownStock);

// own stock by sku id
stockRouter.get(`/get-by-sku`, stockController.ownStockBySkuId);

// transfer to branch
stockRouter.post(`/transfer`, stockController.transfer);

// transfer list
stockRouter.get(`/transfer`, stockController.transferList);

// receive stock list
stockRouter.get(`/receive`, stockController.receiveStock);

// receive stock list
stockRouter.get(`/receive/report`, stockController.receiveReport);

// status update
stockRouter.put(`/status/:stockId`, stockController.statusUpdate);

// transfer to engineer
stockRouter.post(`/transfer-to-engineer`, stockController.transferToEngineer);

export default stockRouter;
