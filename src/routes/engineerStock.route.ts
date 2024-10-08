import { Router } from "express";
import controller from "../controllers/engineerStock.controller";

const engineerStockRouter = Router();

// own stock route
engineerStockRouter.get(`/own`, controller.ownStock);

// engineer stock by sku id
engineerStockRouter.get(`/get-by-sku/:userId/:skuId`, controller.stockBySkuId);

// transfer to engineer
engineerStockRouter.post(`/transfer`, controller.transfer);

// transfer report
engineerStockRouter.get(`/transfer`, controller.brTrReport);

// stock return
engineerStockRouter.post(`/return`, controller.stockReturn);

// return faulty and good stock by branch
engineerStockRouter.get(`/return-stock/:type`, controller.stockByBranch);

// faulty stock return
engineerStockRouter.post(`/faulty-return`, controller.faultyReturn);

// send defective
engineerStockRouter.post(`/defective`, controller.sendDefective);

// defective report
engineerStockRouter.get(`/defective`, controller.sendDeReport);

// faulty stock return report
engineerStockRouter.get(`/report/:userId`, controller.report);

// receive stock
engineerStockRouter.get(`/receive`, controller.receive);

// receive stock
engineerStockRouter.get(`/receive-report/:userId`, controller.stockReport);

// status update
engineerStockRouter.put(`/:stockId`, controller.update);

// get by engineer id
engineerStockRouter.get(`/:id`, controller.getByEngineer);

// csc routes

// csc defective items
engineerStockRouter.get(`/csc/defective`, controller.cscDefective);

// csc defective item action
engineerStockRouter.put(`/csc/defective/:id`, controller.cscActions);

// csc defective action report
engineerStockRouter.get(`/csc/defective/report`, controller.cscDeReport);

export default engineerStockRouter;
