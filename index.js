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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.danal = void 0;
var node_fetch_1 = require("node-fetch");
var danal = /** @class */ (function () {
    function danal(name, phone, carrier) {
        this.name = name;
        this.phone = phone;
        this.carrier = carrier.toUpperCase();
    }
    danal.prototype.startVerification = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sessionRequest, _a, startSession, _b, _c, _d, daptchaData, err_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://www.danalpay.com/customer_support/api/uas_ready", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded"
                                },
                                "method": "POST",
                                "body": "TARGET_URL=%2Fcustomer_support%2Fapi%2Fuas_confirm&UAS_MOBILE=".concat(this.phone, "&UAS_TYPE=UAS_INFO")
                            })];
                    case 1:
                        sessionRequest = _e.sent();
                        _a = this;
                        return [4 /*yield*/, sessionRequest.text().then(function (body) { return (body.match(/<input type="hidden" name="TID" value="(\d+)">/) || [])[1]; })];
                    case 2:
                        _a.tid = _e.sent();
                        this.sessionId = sessionRequest.headers.raw()["set-cookie"][0].replace("session=", "").split(";")[0];
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://wauth.teledit.com/Danal/WebAuth/Web/Start.php", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded"
                                },
                                "method": "POST",
                                "body": "TID=".concat(this.tid, "&IsCharSet=UTF-8&IsDstAddr=").concat(this.phone, "&xx_referurl=https%3A%2F%2Fwww.danalpay.com%2F&IsMobileW=Y")
                            })];
                    case 3:
                        startSession = _e.sent();
                        _b = this;
                        _c = eval;
                        _d = "(()=>{";
                        return [4 /*yield*/, startSession.text().then(function (body) { return body.split("<script>")[1].split("</script>")[0] + "return STARTDATA})()"; })];
                    case 4:
                        _b.startData = _c.apply(void 0, [_d + (_e.sent())]);
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://wauth.teledit.com/Danal/WebAuth/Daptcha/daptcha.js.php?key=".concat(this.startData.serverinfo, "&_=").concat(Date.now())).then(function (res) { return res.text(); })];
                    case 5:
                        daptchaData = _e.sent();
                        this.daptchaEncCode = (daptchaData.match(/var DAPTCHA_ENCCODE = "([\d\w]+)";/) || [])[1];
                        this.daptchaHashCode = (daptchaData.match(/var DAPTCHA_HASHCODE = "([\d\w]+)";/) || [])[1];
                        this.daptchaTimestamp = Date.now();
                        return [2 /*return*/, { "success": true }];
                    case 6:
                        err_1 = _e.sent();
                        return [2 /*return*/, { "success": false, "error": err_1 }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    danal.prototype.solveDaptcha = function (apiKey) {
        return __awaiter(this, void 0, void 0, function () {
            var daptchaImage, captchaTask, captchaResult, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://wauth.teledit.com/Danal/WebAuth/Daptcha/daptcha.bmp.php?data=".concat(this.daptchaEncCode, "&ts=").concat(Date.now())).then(function (res) { return res.arrayBuffer(); })];
                    case 1:
                        daptchaImage = _a.sent();
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://api.anycaptcha.com/createTask", {
                                "headers": {
                                    "content-type": "application/json"
                                },
                                "method": "POST",
                                "body": JSON.stringify({
                                    "clientKey": apiKey,
                                    "task": {
                                        "type": "ImageToTextTask",
                                        "body": Buffer.from(daptchaImage).toString("base64")
                                    }
                                })
                            }).then(function (res) { return res.json(); })];
                    case 2:
                        captchaTask = _a.sent();
                        if (captchaTask.errorId > 0)
                            return [2 /*return*/, { "success": false, "error": captchaTask.errorCode }];
                        _a.label = 3;
                    case 3:
                        if (!true) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://api.anycaptcha.com/getTaskResult", {
                                "headers": {
                                    "content-type": "application/json"
                                },
                                "method": "POST",
                                "body": JSON.stringify({
                                    "clientKey": apiKey,
                                    "taskId": captchaTask.taskId
                                })
                            }).then(function (res) { return res.json(); })];
                    case 4:
                        captchaResult = _a.sent();
                        if (captchaResult.status === "ready")
                            return [2 /*return*/, { "success": true, "solution": captchaResult.solution.text }];
                        else if (captchaResult.errorId > 0)
                            return [2 /*return*/, { "success": false, "error": captchaResult.errorDescription }];
                        return [3 /*break*/, 3];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_2 = _a.sent();
                        return [2 /*return*/, { "success": false, "error": err_2 }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    danal.prototype.requestVerification = function (solution, isPassVerification, iden) {
        if (iden === void 0) { iden = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var verificationRequest, err_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.isPassVerification = isPassVerification;
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.daptchaTimestamp + 3000 - Date.now()); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://wauth.teledit.com/Danal/WebAuth/Web/api/AJAXDeliver.php", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                                },
                                "method": "POST",
                                "body": "ServerInfo=".concat(this.startData.serverinfo, "&TID=").concat(this.tid, "&carrier=").concat(this.carrier, "&agelimit=0&mvnocarrier=mvnocarrier&name=").concat(encodeURIComponent(this.name), "&phone=").concat(this.phone.replace(/-/g, ""), "&iden=").concat(iden, "&captcha=").concat(solution, "&termagree=Y&notiagree=N&isApp=").concat(isPassVerification ? "Y" : "N", "&Device=Mobile&ReferURL=https%3A%2F%2Fwww.danalpay.com%2F&hashcode=").concat(this.daptchaHashCode, "&UseDSK=N&secure_enc_keyboard=&isSaveInfo=N")
                            }).then(function (res) { return res.json(); })];
                    case 2:
                        verificationRequest = _a.sent();
                        if (verificationRequest.RETURNCODE === "0000")
                            return [2 /*return*/, { "success": true, "data": verificationRequest }];
                        else
                            return [2 /*return*/, { "success": false, "error": "[".concat(verificationRequest.RETURNCODE, "] ").concat(verificationRequest.RETURNMSG) }];
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        return [2 /*return*/, { "success": false, "error": err_3 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    danal.prototype.finishVerification = function (otp) {
        return __awaiter(this, void 0, void 0, function () {
            var verificationRequest, confirmRequest, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://wauth.teledit.com/Danal/WebAuth/Web/api/AJAXAppReport.php", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded"
                                },
                                "method": "POST",
                                "body": "TID=" + this.tid + (this.isPassVerification ? "&otp=" + otp : "")
                            }).then(function (res) { return res.json(); })];
                    case 1:
                        verificationRequest = _a.sent();
                        if (verificationRequest.RETURNCODE !== "0000")
                            return [2 /*return*/, { "success": false, "error": "[".concat(verificationRequest.RETURNCODE, "] ").concat(verificationRequest.RETURNMSG) }];
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://www.danalpay.com//customer_support/api/uas_confirm", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                    "cookie": "session=" + this.sessionId
                                },
                                "method": "POST",
                                "body": "TID=".concat(this.tid, "&dndata=").concat(this.startData.dndata, "&BackURL=&IsMobileW=Y&IsCharSet=UTF-8&IsDstAddr=").concat(this.phone.replace(/-/g, ""), "&IsCarrier=&IsExceptCarrier=null&xx_referurl=https%3A%2F%2Fwww.danalpay.com%2F")
                            })];
                    case 2:
                        confirmRequest = _a.sent();
                        this.sessionId = confirmRequest.headers.raw()["set-cookie"][0].replace("session=", "").split(";")[0];
                        return [2 /*return*/, { "success": Boolean(this.sessionId) }];
                    case 3:
                        err_4 = _a.sent();
                        return [2 /*return*/, { "success": false, "error": err_4 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    danal.prototype.isVerified = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transactionList, _a, err_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, node_fetch_1["default"])("https://www.danalpay.com/customer_support/api/search_transaction_list", {
                                "headers": {
                                    "content-type": "application/x-www-form-urlencoded",
                                    "cookie": "session=" + this.sessionId
                                },
                                "method": "POST",
                                "body": "TYPE=mobile&MOBILE=".concat(this.phone.replace(/-/g, ""), "&START_YYMM=&END_YYMM=")
                            })];
                    case 1:
                        transactionList = _c.sent();
                        _b = { "success": transactionList.status === 200 };
                        _a = "data";
                        return [4 /*yield*/, transactionList.json()];
                    case 2: return [2 /*return*/, (_b[_a] = _c.sent(), _b)];
                    case 3:
                        err_5 = _c.sent();
                        return [2 /*return*/, { "success": false, "error": err_5 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return danal;
}());
exports.danal = danal;
