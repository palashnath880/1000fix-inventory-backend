import { Router } from "express";
import controller from "../controllers/engineerStock.controller";

const engineerStockRouter = Router();

// own stock route
engineerStockRouter.get(`/own`, controller.ownStock);

// engineer stock by sku id
engineerStockRouter.get(`/get-by-sku/:userId/:skuId`, controller.stockBySkuId);

// transfer to engineer
engineerStockRouter.post(`/transfer`, controller.transfer);

// faulty stock return
engineerStockRouter.post(`/faulty-return`, controller.faultyReturn);

// faulty stock return report
engineerStockRouter.get(
  `/faulty-return-report/:userId`,
  controller.faultyReturnReport
);

// receive stock
engineerStockRouter.get(`/receive`, controller.receive);

// receive stock
engineerStockRouter.get(`/receive-report/:userId`, controller.stockReport);

// status update
engineerStockRouter.put(`/:stockId`, controller.update);

export default engineerStockRouter;
