// A real account with the wrong password is rejected, and no authenticator step starts.
// From Backend: node scripts/mfa-login/2-wrong-password.cjs
const http = require("http");

const email = "paul.test@gmail.com";
const password = "not-the-password";

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

login({ email, password })
    .then((res) => {
        const rejected =
            res.status === 400 &&
            res.body.includes("Credential is not right") &&
            !res.body.includes("mfaRequired") &&
            !res.cookie;
        if (!rejected) {
            console.error("FAIL", res.status);
            console.error(res.body.slice(0, 300));
            process.exit(1);
        }
        console.log("PASS wrong password rejected");
    })
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });
