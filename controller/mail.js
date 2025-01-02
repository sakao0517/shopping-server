import dotenv from "dotenv";
import { createTransport } from "nodemailer";
dotenv.config();

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: String(process.env.EMAIL),
    pass: String(process.env.EMAIL_PASSWORD),
  },
});

export async function sendResetPasswordEmail(email, token) {
  if (!email || !token) return;
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `테스트 <${process.env.EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "비밀번호 초기화를 위한 안내 메일입니다", // Subject line
    html:
      "<p>비밀번호 초기화를 위해 아래의 URL을 클릭하여 주세요.</p>" +
      `<a href="${process.env.CLIENT_URL}/account/resetPassword?token=${token}">비밀번호 재설정 링크</a>`, // html body
  });

  console.log("Message sent: %s", info);
}

sendResetPasswordEmail().catch(console.error);
