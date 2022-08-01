const danal = require("./index");

(async function() {
    const danalAPI = new danal.danal("홍길동", "010-1234-5678", "SKT");

    const verificationStart = await danalAPI.startVerification();
    if (verificationStart.success) console.log("Danal Verification Started!");
    else throw new Error(verificationStart.error);

    const captchaData = await danalAPI.solveDaptcha("");
    if (captchaData.success) console.log(`Danal Captcha Solved - ${captchaData.solution}!`);
    else throw new Error(captchaData.error);

    const verificationRequest = await danalAPI.requestVerification(captchaData.solution, true);
    if (verificationRequest.success) console.log(`Danal Verification Requested - ${verificationRequest.data.RETURNCODE} ${verificationRequest.data.RETURNMSG}!`);
    else throw new Error(verificationRequest.error);

    while (true) {
        await new Promise(resolve => setTimeout(resolve, 10000));

        const verificationFinish = await danalAPI.finishVerification();
        if (verificationFinish.success) {
            console.log("Danal Verification Finished!");
            break;
        }
        if (!verificationFinish.error.startsWith("[2371]")) throw new Error(verificationFinish.error);
    }

    const isVerified = await danalAPI.isVerified();
    if (isVerified.success) console.log("Danal Verification Success!");
    else throw new Error(isVerified.error);
})();