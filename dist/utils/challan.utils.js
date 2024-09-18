"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChallan = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const generateChallan = () => {
    const time = moment_timezone_1.default.tz("Asia/Dhaka");
    const year = time.format("YY");
    const month = time.format("MM");
    const day = time.format("DD");
    const hour = time.format("HH");
    const minute = time.format("mm");
    return `${year}${month}${day}${hour}${minute}`;
};
exports.generateChallan = generateChallan;
