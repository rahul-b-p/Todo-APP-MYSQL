import { SentMessageInfo } from "nodemailer";

export type EmailOptions = {
    to: string,
    subject: string,
    text: string,
    html: string
}


export type OTPMailResponse = {
    mailInfo: SentMessageInfo;
    otp: string;
}