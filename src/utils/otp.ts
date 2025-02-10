/**
 * To generate a new OTP
 */
export const generateOtp = ():string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}