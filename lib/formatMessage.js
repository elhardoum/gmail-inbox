"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMessage = void 0;
/**
 * Method is being called by Inbox class
 *
 * @param message
 */
var formatMessage = function (message) {
    var _a;
    var headers = (_a = message.data.payload) === null || _a === void 0 ? void 0 : _a.headers;
    var prettyMessage = {
        body: getMessageBody(message),
        from: getHeader('From', headers),
        historyId: message.data.historyId,
        internalDate: message.data.internalDate,
        labelIds: message.data.labelIds,
        messageId: message.data.id,
        snippet: message.data.snippet,
        threadId: message.data.threadId,
        to: getHeader('To', headers),
        subject: getHeader('Subject', headers),
        receivedOn: getHeader('Date', headers),
        getFullMessage: function () { return message.data.payload; },
    };
    return prettyMessage;
};
exports.formatMessage = formatMessage;
var getHeader = function (name, headers) {
    if (!headers) {
        return;
    }
    var header = headers.find(function (h) { return h.name === name; });
    return header && header.value != null ? header.value : undefined;
};
var getMessageBody = function (message) {
    var body = {};
    var messagePayload = message.data.payload;
    var messageBody = messagePayload === null || messagePayload === void 0 ? void 0 : messagePayload.body;
    if ((messageBody === null || messageBody === void 0 ? void 0 : messageBody.size) && messagePayload) {
        switch (messagePayload === null || messagePayload === void 0 ? void 0 : messagePayload.mimeType) {
            case 'text/html':
                body.html = Buffer.from(messageBody.data, 'base64').toString('utf8');
                break;
            case 'text/plain':
            default:
                body.text = Buffer.from(messageBody.data, 'base64').toString('utf8');
                break;
        }
    }
    else {
        body = getPayloadParts(message);
    }
    return body;
};
var getPayloadParts = function (message) {
    var _a;
    var body = {};
    var parts = (_a = message.data.payload) === null || _a === void 0 ? void 0 : _a.parts;
    var hasSubParts = parts === null || parts === void 0 ? void 0 : parts.find(function (part) { var _a; return (_a = part.mimeType) === null || _a === void 0 ? void 0 : _a.startsWith('multipart/'); });
    if (hasSubParts) {
        // recursively continue until you find the content
        var newMessage = {
            Headers: {},
            config: {},
            data: { payload: hasSubParts },
        };
        return getPayloadParts(newMessage);
    }
    var htmlBodyPart = parts === null || parts === void 0 ? void 0 : parts.find(function (part) { return part.mimeType === 'text/html'; });
    if (htmlBodyPart && htmlBodyPart.body && htmlBodyPart.body.data) {
        body.html = Buffer.from(htmlBodyPart.body.data, 'base64').toString('utf8');
    }
    var textBodyPart = parts === null || parts === void 0 ? void 0 : parts.find(function (part) { return part.mimeType === 'text/plain'; });
    if (textBodyPart && textBodyPart.body && textBodyPart.body.data) {
        body.text = Buffer.from(textBodyPart.body.data, 'base64').toString('utf8');
    }
    return body;
};
