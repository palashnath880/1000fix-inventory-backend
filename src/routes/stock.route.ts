import { Router } from "express";
import stockController from "../controllers/stock.controller";

const stockRouter = Router();

// entry route
stockRouter.post(`/entry`, stockController.entry);

// get entry list route
stockRouter.get(`/entry`, stockController.entryList);

// own stock roue
stockRouter.get(`/own`, stockController.ownStock);

// branch stock route
stockRouter.get(`/branch`, stockController.branchStock);

// own stock by sku id
stockRouter.get(`/get-by-sku`, stockController.ownStockBySkuId);

// engineer stock by sku id
stockRouter.get(
  `/get-by-sku/:engineerId/:skuId`,
  stockController.engineerStockBySku
);

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

// get approval stock
stockRouter.get(`/approval`, stockController.approvalStock);

// get defective stock
stockRouter.get(`/defective`, stockController.getDefective);

// send defective stock
stockRouter.post(`/defective-send`, stockController.sendDefective);

// faulty to good
stockRouter.post(`/faulty-to-good`, stockController.moveToGood);

// purchase return
stockRouter.post(`/purchase-return`, stockController.purchaseReturn);

// purchase return list
stockRouter.get(`/purchase-return`, stockController.purchaseReturnList);

export default stockRouter;
