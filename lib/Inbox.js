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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inbox = void 0;
var googleapis_1 = require("googleapis");
// support for typescript debugging (refers to ts files instead of the transpiled js files)
var sourceMapSupport = require("source-map-support");
var formatMessage_1 = require("./formatMessage");
var GoogleAuthorizer_1 = require("./GoogleAuthorizer");
sourceMapSupport.install();
var Inbox = /** @class */ (function () {
    function Inbox(credentialsJsonPath, tokenPath) {
        if (tokenPath === void 0) { tokenPath = 'gmail-token.json'; }
        this.credentialsJsonPath = credentialsJsonPath;
        this.tokenPath = tokenPath;
        this.gmailApi = googleapis_1.google.gmail('v1');
        this.authenticated = false;
    }
    Inbox.prototype.authenticateAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oAuthClient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, GoogleAuthorizer_1.authorizeAccount)(this.credentialsJsonPath, this.tokenPath)];
                    case 1:
                        oAuthClient = _a.sent();
                        this.gmailApi = googleapis_1.google.gmail({ version: 'v1', auth: oAuthClient });
                        this.authenticated = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Inbox.prototype.getAllLabels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.guardAuthentication();
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.gmailApi.users.labels.list({
                            userId: 'me',
                        }, function (errorMessage, result) {
                            if (errorMessage) {
                                reject(errorMessage);
                                return;
                            }
                            resolve(result === null || result === void 0 ? void 0 : result.data.labels);
                        });
                    })];
            });
        });
    };
    /**
     * Retrieves all existing emails
     */
    Inbox.prototype.getLatestMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var messages, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.guardAuthentication();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.findMessages({
                                labels: ['inbox'],
                            })];
                    case 2:
                        messages = _a.sent();
                        if (messages && messages !== undefined) {
                            return [2 /*return*/, messages];
                        }
                        else {
                            return [2 /*return*/, []];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log('gmail-inbox error:', e_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Finds existing emails
     *
     * Example search query
     * - "has:attachment filename:salary.pdf largerThan:1000000 label:(paychecks salaries) from:myoldcompany@oldcompany.com"
     * - {
     *   has: "attachment",
     *   filename: "salary.pdf",
     *   largerThanInBytes: 1000000,
     *   labels: ["paychecks", "salaries"],
     *   from: "myoldcompany@oldcompany.com"
     * }
     */
    Inbox.prototype.findMessages = function (searchQuery) {
        var _this = this;
        this.guardAuthentication();
        return new Promise(function (resolve, reject) {
            var searchString;
            if (typeof searchQuery === 'string' || searchQuery === undefined) {
                searchString = searchQuery;
            }
            else {
                searchString = _this.mapSearchQueryToSearchString(searchQuery);
            }
            var query = {
                userId: 'me',
            };
            if (searchString) {
                query.q = searchString;
            }
            if (typeof searchQuery === 'object' && searchQuery.maxResults) {
                query.maxResults = searchQuery.maxResults;
            }
            _this.gmailApi.users.messages.list(query, function (errorMessage, result) { return __awaiter(_this, void 0, void 0, function () {
                var gmailMessages, messages;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (errorMessage) {
                                reject(errorMessage);
                                return [2 /*return*/];
                            }
                            gmailMessages = result === null || result === void 0 ? void 0 : result.data.messages;
                            if (!gmailMessages) {
                                return [2 /*return*/, resolve([])];
                            }
                            return [4 /*yield*/, Promise.all(gmailMessages.map(function (message) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        if (message.id) {
                                            return [2 /*return*/, this.getMessageById(message.id)];
                                        }
                                        return [2 /*return*/, null];
                                    });
                                }); }))];
                        case 1:
                            messages = _a.sent();
                            messages.filter(function (message) { return !!message === true; });
                            resolve(messages);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    /**
     *
     * @param searchQuery similar to findMessages, the query how it will find the message
     * @param timeTillNextCallInSeconds How long it should wait till it checks again if the message is received
     * @param maxWaitTimeInSeconds How long it should wait in total for the message
     */
    Inbox.prototype.waitTillMessage = function (searchQuery, shouldLogEvents, timeTillNextCallInSeconds, maxWaitTimeInSeconds) {
        var _this = this;
        if (shouldLogEvents === void 0) { shouldLogEvents = true; }
        if (timeTillNextCallInSeconds === void 0) { timeTillNextCallInSeconds = 5; }
        if (maxWaitTimeInSeconds === void 0) { maxWaitTimeInSeconds = 60; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var waitTime, timeDiffInSeconds, messages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        waitTime = new Date();
                        timeDiffInSeconds = 0;
                        this.log(shouldLogEvents, 'finding message based on SearchQuery:', searchQuery);
                        return [4 /*yield*/, this.findMessages(searchQuery)];
                    case 1:
                        messages = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!!messages.length) return [3 /*break*/, 5];
                        timeDiffInSeconds = (Date.now() - waitTime.getTime()) / 1000;
                        if (timeDiffInSeconds && maxWaitTimeInSeconds - timeDiffInSeconds <= 0) {
                            this.log(shouldLogEvents, 'Could not find message within time limit of searchQuery:', searchQuery);
                            reject("No message found for searchQuery: ".concat(JSON.stringify(searchQuery)));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.timeout(timeTillNextCallInSeconds * 1000)];
                    case 3:
                        _a.sent();
                        this.log(shouldLogEvents, "".concat(timeDiffInSeconds, " seconds passed, trying again with SearchQuery:"), searchQuery);
                        return [4 /*yield*/, this.findMessages(searchQuery)];
                    case 4:
                        messages = _a.sent();
                        return [3 /*break*/, 2];
                    case 5:
                        resolve(messages);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Inbox.prototype.log = function (shouldLog) {
        var messages = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            messages[_i - 1] = arguments[_i];
        }
        if (shouldLog) {
            messages.unshift('Gmail-inbox:');
            console.log.apply(console, messages);
        }
    };
    Inbox.prototype.timeout = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    Inbox.prototype.getMessageById = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.gmailApi.users.messages.get({
                            format: 'full',
                            id: messageId,
                            userId: 'me',
                        }, function (errorMessage, message) {
                            if (errorMessage) {
                                reject(errorMessage);
                            }
                            else {
                                resolve((0, formatMessage_1.formatMessage)(message));
                            }
                        });
                    })];
            });
        });
    };
    Inbox.prototype.guardAuthentication = function () {
        if (!this.authenticated) {
            throw new Error('Please authenticate with Inbox.authenticate() before performing any action');
        }
    };
    Inbox.prototype.arrayToAdvancedSearchString = function (itemOrItems) {
        if (typeof itemOrItems === 'string') {
            return itemOrItems;
        }
        return "(".concat(itemOrItems.join(' '), ")");
    };
    Inbox.prototype.mapSearchQueryToSearchString = function (searchQuery) {
        var searchString = '';
        if (searchQuery.message) {
            searchString += searchQuery.message;
        }
        if (searchQuery.subject) {
            searchString += "subject: ".concat(this.arrayToAdvancedSearchString(searchQuery.subject), " ");
        }
        if (searchQuery.mustContainText) {
            searchString += "\"".concat(searchQuery.mustContainText, "\" ");
        }
        if (searchQuery.from) {
            searchString += "from: ".concat(this.arrayToAdvancedSearchString(searchQuery.from), " ");
        }
        if (searchQuery.to) {
            searchString += "to: ".concat(this.arrayToAdvancedSearchString(searchQuery.to), " ");
        }
        if (searchQuery.cc) {
            searchString += "cc: ".concat(searchQuery.cc, " ");
        }
        if (searchQuery.bcc) {
            searchString += "bcc: ".concat(searchQuery.bcc, " ");
        }
        if (searchQuery.labels) {
            searchString += "label: ".concat(this.arrayToAdvancedSearchString(searchQuery.labels), " ");
        }
        if (searchQuery.has) {
            searchString += "has:".concat(searchQuery.has, " ");
        }
        if (searchQuery.filenameExtension) {
            searchString += "filename:".concat(searchQuery.filenameExtension, " ");
        }
        if (searchQuery.filename) {
            searchString += "filename:".concat(searchQuery.filename, " ");
        }
        if (searchQuery.is) {
            searchString += "is: ".concat(searchQuery.is, " ");
        }
        if (searchQuery.olderThan && searchQuery.olderThan.amount > 0) {
            var range = searchQuery.olderThan;
            searchString += "older_than:".concat(range.amount).concat(range.period.substr(0, 1), " ");
        }
        if (searchQuery.newerThan && searchQuery.newerThan.amount > 0) {
            var range = searchQuery.newerThan;
            searchString += "newer_than:".concat(range.amount).concat(range.period.substr(0, 1), " ");
        }
        if (searchQuery.category) {
            searchString += "category:".concat(searchQuery.category, " ");
        }
        if (searchQuery.before) {
            searchString += "before:".concat(this.mapDateTypeToQuery(searchQuery.before), " ");
        }
        if (searchQuery.after) {
            searchString += "after:".concat(this.mapDateTypeToQuery(searchQuery.after), " ");
        }
        if (searchQuery.newer) {
            searchString += "newer:".concat(this.mapDateTypeToQuery(searchQuery.newer), " ");
        }
        if (searchQuery.older) {
            searchString += "older:".concat(this.mapDateTypeToQuery(searchQuery.older), " ");
        }
        return searchString;
    };
    Inbox.prototype.mapDateTypeToQuery = function (dateType) {
        if (typeof dateType === 'number') {
            return dateType;
        }
        var date = dateType.date;
        switch (dateType.precision) {
            case undefined:
            case null:
            case 'milliseconds':
                return Math.floor(date.getTime() / 1000);
            case 'day':
                return this.formatDate(date);
            case 'year':
                return date.getFullYear();
        }
    };
    Inbox.prototype.formatDate = function (date) {
        var month = '' + (date.getMonth() + 1);
        var day = '' + date.getDate();
        var year = date.getFullYear();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        return [year, month, day].join('/');
    };
    Inbox.prototype.getApiClient = function () {
        return this.gmailApi;
    };
    return Inbox;
}());
exports.Inbox = Inbox;
