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

export async function sendOrderEmail(email, order) {
  if (!email || !order) return;
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `<${process.env.EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: `[브랜드이름] 주문이 접수되었습니다.`, // Subject line
    html:
      `<p>${order.name} 고객님</p>` +
      `<br />` +
      `<p>주문이 접수되었습니다.</p>` +
      `<p>주문하신 상품은 주문 확인 후 발송될 예정입니다.</p>` +
      `<br />` +
      `<p>주문 번호: ${order.orderId}</p>` +
      `<br />` +
      `<p>감사합니다.</p>`,
  });

  console.log("Message sent: %s", info);
}

sendOrderEmail().catch(console.error);
