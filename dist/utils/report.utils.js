"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agingReportBySku = void 0;
const server_1 = require("../server");
const stock_utils_1 = require("./stock.utils");
const agingReportBySku = (branchId, skuId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
    const stock = yield (0, stock_utils_1.branchStockBySkuId)(branchId, skuId, isAdmin);
    const arr = [];
    if ((stock === null || stock === void 0 ? void 0 : stock.quantity) <= 0)
        return null;
    const rows = yield server_1.prisma.stock.findMany({
        where: {
            OR: [isAdmin ? { senderId: branchId } : { receiverId: branchId }],
            skuCodeId: skuId,
            type: isAdmin ? "entry" : "transfer",
        },
        select: {
            createdAt: true,
            quantity: true,
            type: true,
            skuCodeId: true,
        },
        orderBy: { createdAt: "desc" },
    });
    for (const row of rows) {
        if (!row.quantity)
            continue;
        const quantity = Math.min(stock.quantity, row.quantity);
        arr.push(Object.assign(Object.assign({}, row), { quantity }));
        stock.quantity -= quantity;
    }
    return arr;
});
exports.agingReportBySku = agingReportBySku;
