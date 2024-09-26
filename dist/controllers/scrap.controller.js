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
const server_1 = require("../server");
const challan_utils_1 = require("../utils/challan.utils");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = req.body;
        const challanNo = `SC-${(0, challan_utils_1.generateChallan)()}`;
        data.challanNo = challanNo;
        data.branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const result = yield server_1.prisma.scrap.create({
            data: Object.assign(Object.assign({}, data), { items: {
                    create: data.items,
                } }),
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create };
