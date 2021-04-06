const functions = require("firebase-functions");
const { RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole } = require('agora-access-token')

exports.doCreateAgoraToken = functions.https.onCall((request, response) => {
    console.log(request);
    const appID = '06a36da434694cf39d513ef2e9214d5d'; // app Id cua em
    const appCertificate = 'e143b1412ec74fc8afa2447aef162138'; // same =))))
    const channelName = request.channelName;
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 360000
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    const token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
    return {
        token,
        success: true
    };
});