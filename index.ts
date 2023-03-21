import fetch from "node-fetch";

export class danal {
    name: string;
    phone: string;
    carrier: string;
    isPassVerification: boolean;
    daptchaEncCode: string;
    daptchaHashCode: string;
    daptchaTimestamp: number;
    tid: string;
    sessionId: string;
    startData: any;

    constructor(name: string, phone: string, carrier: string) {
        this.name = name;
        this.phone = phone;
        this.carrier = carrier.toUpperCase();
    }

    async startVerification() {
        try {
            const sessionRequest = await fetch("https://www.danalpay.com/customer_support/api/uas_ready", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded"
                },
                "method": "POST",
                "body": `TARGET_URL=%2Fcustomer_support%2Fapi%2Fuas_confirm&UAS_MOBILE=${this.phone}&UAS_TYPE=UAS_INFO`
            });

            this.tid = await sessionRequest.text().then((body: string) => (body.match(/<input type="hidden" name="TID" value="(\d+)">/) || [])[1]);
            this.sessionId = sessionRequest.headers.raw()["set-cookie"][0].replace("session=", "").split(";")[0];

            const startSession = await fetch("https://wauth.teledit.com/Danal/WebAuth/Web/Start.php", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded"
                },
                "method": "POST",
                "body": `TID=${this.tid}&IsCharSet=UTF-8&IsDstAddr=${this.phone}&xx_referurl=https%3A%2F%2Fwww.danalpay.com%2F&IsMobileW=Y`
            });

            this.startData = eval("(()=>{" + await startSession.text().then((body: string) => body.split("<script>")[1].split("</script>")[0] + "return STARTDATA})()"));

            const daptchaData: string = await fetch(`https://wauth.teledit.com/Danal/WebAuth/Daptcha/daptcha.js.php?key=${this.startData.serverinfo}&_=${Date.now()}`).then(res => res.text());

            this.daptchaEncCode = (daptchaData.match(/var DAPTCHA_ENCCODE = "([\d\w]+)";/) || [])[1];
            this.daptchaHashCode = (daptchaData.match(/var DAPTCHA_HASHCODE = "([\d\w]+)";/) || [])[1];
            this.daptchaTimestamp = Date.now();

            return {"success": true};
        }
        catch (err) {
            return {"success": false, "error": err};
        }
    }

    async solveDaptcha(apiKey: string) {
        try {
            const daptchaImage: ArrayBuffer = await fetch(`https://wauth.teledit.com/Danal/WebAuth/Daptcha/daptcha.bmp.php?data=${this.daptchaEncCode}&ts=${Date.now()}`).then(res => res.arrayBuffer());

            const captchaTask: any = await fetch("https://api.anycaptcha.com/createTask", {
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
            }).then(res => res.json());

            if (captchaTask.errorId > 0) return {"success": false, "error": captchaTask.errorCode};

            while (true) {
                const captchaResult: any = await fetch("https://api.anycaptcha.com/getTaskResult", {
                    "headers": {
                        "content-type": "application/json"
                    },
                    "method": "POST",
                    "body": JSON.stringify({
                        "clientKey": apiKey,
                        "taskId": captchaTask.taskId
                    })
                }).then(res => res.json());

                if (captchaResult.status === "ready") return {"success": true, "solution": captchaResult.solution.text};
                else if (captchaResult.errorId > 0) return {"success": false, "error": captchaResult.errorDescription};
            }
        }
        catch (err) {
            return {"success": false, "error": err};
        }
    }

    async requestVerification(solution: string, isPassVerification: boolean, iden = "") {
        try {
            this.isPassVerification = isPassVerification;
            await new Promise(resolve => setTimeout(resolve, this.daptchaTimestamp + 3000 - Date.now()));

            const verificationRequest: any = await fetch("https://wauth.teledit.com/Danal/WebAuth/Web/api/AJAXDeliver.php", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                "method": "POST",
                "body": `ServerInfo=${this.startData.serverinfo}&TID=${this.tid}&carrier=${this.carrier}&agelimit=0&mvnocarrier=mvnocarrier&name=${encodeURIComponent(this.name)}&phone=${this.phone.replace(/-/g, "")}&iden=${iden}&captcha=${solution}&termagree=Y&notiagree=N&isApp=${isPassVerification ? "Y" : "N"}&Device=Mobile&ReferURL=https%3A%2F%2Fwww.danalpay.com%2F&hashcode=${this.daptchaHashCode}&UseDSK=N&secure_enc_keyboard=&isSaveInfo=N`
            }).then(res => res.json());

            if (verificationRequest.RETURNCODE === "0000") return {"success": true, "data": verificationRequest};
            else return {"success": false, "error": `[${verificationRequest.RETURNCODE}] ${verificationRequest.RETURNMSG}`};
        }
        catch (err) {
            return {"success": false, "error": err};
        }
    }

    async finishVerification(otp: string) {
        try {
            const verificationRequest: any = await fetch("https://wauth.teledit.com/Danal/WebAuth/Web/api/AJAXAppReport.php", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded"
                },
                "method": "POST",
                "body": "TID=" + this.tid + (this.isPassVerification ? "" : "&otp=" + otp)
            }).then(res => res.json());

            if (verificationRequest.RETURNCODE !== "0000") return {"success": false, "error": `[${verificationRequest.RETURNCODE}] ${verificationRequest.RETURNMSG}`};

            const confirmRequest = await fetch("https://www.danalpay.com//customer_support/api/uas_confirm", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    "cookie": "session=" + this.sessionId
                },
                "method": "POST",
                "body": `TID=${this.tid}&dndata=${this.startData.dndata}&BackURL=&IsMobileW=Y&IsCharSet=UTF-8&IsDstAddr=${this.phone.replace(/-/g, "")}&IsCarrier=&IsExceptCarrier=null&xx_referurl=https%3A%2F%2Fwww.danalpay.com%2F`
            });

            this.sessionId = confirmRequest.headers.raw()["set-cookie"][0].replace("session=", "").split(";")[0];

            return {"success": Boolean(this.sessionId)};
        }
        catch (err) {
            return {"success": false, "error": err};
        }
    }

    async isVerified() {
        try {
            const transactionList = await fetch("https://www.danalpay.com/customer_support/api/search_transaction_list", {
                "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    "cookie": "session=" + this.sessionId
                },
                "method": "POST",
                "body": `TYPE=mobile&MOBILE=${this.phone.replace(/-/g, "")}&START_YYMM=&END_YYMM=`
            });

            return {"success": transactionList.status === 200, "data": await transactionList.json()};
        }
        catch (err) {
            return {"success": false, "error": err};
        }
    }
}
