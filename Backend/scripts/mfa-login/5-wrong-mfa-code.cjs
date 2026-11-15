// The right password plus a wrong 6-digit code is rejected as a bad code.
// From Backend: node scripts/mfa-login/5-wrong-mfa-code.cjs
const http = require("http");

const email = "paul.test@gmail.com";
const password = "Password123!";
const code = "000000";

function login(body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req = http.request(
            {
                hostname: "localhost",
                port: 2424,
                path: "/api/auth/login",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(data),
                },
            },
            (res) => {
                let raw = "";
                res.on("data", (chunk) => {
                    raw += chunk;
                });
                res.on("end", () => {
                    resolve({
                        status: res.statusCode,
                        body: raw,
                        cookie: Boolean(res.headers["set-cookie"]),
                    });
                });
            }
        );
        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

login({ email, password, secret: code })
    .then((res) => {
        const rejected =
            res.status === 401 &&
            res.body.includes("TOTP code is not valid") &&
            !res.cookie;
        if (!rejected) {
            console.error("FAIL", res.status);
            console.error(res.body.slice(0, 300));
            process.exit(1);
        }
        console.log("PASS wrong authenticator code rejected");
    })
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });
