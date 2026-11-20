// Quick check that our authenticator link is the standard 6-digit / 30-second kind,
// and that a code from that secret verifies while a different code does not.
// Run from Backend after tsc: node scripts/test-mfa-totp.cjs
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const {
    generateMfaSecret,
    buildOtpAuthUrl,
    verifyTotp,
} = require("../dist/controllers/authentication/mfa.util");

const secret = generateMfaSecret();
const url = buildOtpAuthUrl("user@example.com", secret);

if (!url.startsWith("otpauth://totp/Computotal:user%40example.com?")) {
    throw new Error("otpauth label is wrong: " + url);
}
["algorithm=SHA1", "digits=6", "period=30", "issuer=Computotal", "secret=" + secret].forEach((part) => {
    if (!url.includes(part)) {
        throw new Error("otpauth url missing " + part);
    }
});

const token = speakeasy.totp({ secret, encoding: "base32", step: 30, digits: 6 });
if (!verifyTotp(secret, token)) {
    throw new Error("current code was rejected");
}
if (!verifyTotp(secret, token.slice(0, 3) + " " + token.slice(3))) {
    throw new Error("spaced code was rejected");
}

const wrong = String((Number(token) + 1) % 1000000).padStart(6, "0");
if (wrong !== token && verifyTotp(secret, wrong)) {
    throw new Error("wrong code was accepted");
}
if (verifyTotp(secret, "")) {
    throw new Error("empty code was accepted");
}
if (verifyTotp(secret, "12345")) {
    throw new Error("short code was accepted");
}

qrcode.toDataURL(url).then((dataUrl) => {
    if (!dataUrl.startsWith("data:image/png;base64,")) {
        throw new Error("QR code was not a PNG data URL");
    }
    console.log("mfa totp ok");
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
