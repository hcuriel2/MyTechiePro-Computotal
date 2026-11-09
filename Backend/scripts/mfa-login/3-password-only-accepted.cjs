// Correct email and password sign in when the authenticator is off.
// From Backend: node scripts/mfa-login/3-password-only-accepted.cjs
const http = require("http");

const email = "paul.test@gmail.com";
const password = "Password123!";

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
        let user = {};
        try {
            user = JSON.parse(res.body);
        } catch (error) {
            user = {};
        }
        const accepted =
            res.status === 200 &&
            res.cookie &&
            user.email === email &&
            !user.mfaRequired;
        if (!accepted) {
            console.error("FAIL", res.status);
            console.error(res.body.slice(0, 300));
            process.exit(1);
        }
        console.log("PASS password-only login accepted");
    })
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });
