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

export async function sendReturnEmail(email, order, cancelAmount) {
  if (!email || !order) return;
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `<${process.env.EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "[브랜드이름] 반품이 완료되었습니다.", // Subject line
    html:
      `<p>${order.name} 고객님</p>` +
      `<br />` +
      `<p>아래 주문번호의 반품이 완료되었습니다.</p>` +
      `<br />` +
      `<p>주문 번호: ${order.orderId}</p>` +
      `<p>환불예정금액: ${cancelAmount}</p>` +
      `<br />` +
      `<p>감사합니다.</p>`,
  });

  console.log("Message sent: %s", info);
}

sendReturnEmail().catch(console.error);
