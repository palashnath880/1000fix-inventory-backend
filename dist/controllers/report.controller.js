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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const server_1 = require("../server");
// scrap report
const scrap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let fromDate = req.query.fromDate;
        fromDate = fromDate ? new Date(fromDate) : new Date();
        let toDate = req.query.toDate;
        toDate = toDate
            ? new Date(toDate)
            : new Date(moment_timezone_1.default.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));
        const result = yield server_1.prisma.scrap.findMany({
            where: { createdAt: { gte: fromDate, lte: toDate } },
            include: {
                items: {
                    include: {
                        skuCode: {
                            include: {
                                item: { include: { model: { include: { category: true } } } },
                            },
                        },
                    },
                },
            },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { scrap };
