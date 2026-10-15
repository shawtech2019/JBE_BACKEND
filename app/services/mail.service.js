const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const nodemailer = require("nodemailer");

const TEMPLATES_DIR = path.join(__dirname, "..", "emails");
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const APP_NAME = process.env.APP_NAME || "Jordan Brooke Estate";
const MAIL_FROM =
  process.env.MAIL_FROM || `"${APP_NAME}" <no-reply@jordanbrookeestates.com>`;

let transporter = null;
let usingFallback = false;
let initPromise = null;

/* ------------------------------------------------------------------ */
/* Templating (lodash)                                                 */
/* ------------------------------------------------------------------ */

const renderPartial = (segments, data) => {
  const file = path.join(TEMPLATES_DIR, ...segments);
  const source = fs.readFileSync(file, "utf8");
  return _.template(source)(data);
};

/**
 * Render a content template, then wrap it in the shared base layout.
 */
const renderEmail = (templateName, data) => {
  const content = renderPartial(["templates", `${templateName}.html`], {
    appName: APP_NAME,
    ...data,
  });

  return renderPartial(["layouts", "base.html"], {
    appName: APP_NAME,
    year: new Date().getFullYear(),
    subject: data.subject || APP_NAME,
    previewText: data.previewText || "",
    content,
  });
};

/* ------------------------------------------------------------------ */
/* Transport                                                           */
/* ------------------------------------------------------------------ */

const createSmtpTransport = () => {
  const { MAIL_HOST, MAIL_PORT, MAIL_SECURE } = process.env;
  const user = process.env.MAIL_USERNAME || process.env.EMAIL_USER;
  const pass = process.env.MAIL_PASSWORD || process.env.EMAIL_PASS;

  if (!MAIL_HOST || !user || !pass) return null;

  return nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT) || 587,
    secure: MAIL_SECURE === "true",
    auth: { user, pass },
  });
};

const createEtherealTransport = async () => {
  const account = await nodemailer.createTestAccount();
  const transport = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
  return { transport, account };
};

/**
 * Resolve (once) the transport to use. Prefers the configured SMTP provider;
 * in development, falls back to an Ethereal test inbox if SMTP is missing or
 * its credentials are rejected, so OTP mail still fires and is previewable.
 */
const initMailer = () => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (process.env.MAIL_DRIVER === "ethereal" && !IS_PRODUCTION) {
      const { transport, account } = await createEtherealTransport();
      transporter = transport;
      usingFallback = true;
      console.warn("[mail] Using Ethereal test inbox (MAIL_DRIVER=ethereal)");
      console.warn(`[mail] Sign in at https://ethereal.email  user=${account.user} pass=${account.pass}`);
      return transporter;
    }

    const smtp = createSmtpTransport();

    if (smtp) {
      try {
        await smtp.verify();
        transporter = smtp;
        console.log(
          `[mail] SMTP ready via ${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`
        );
        return transporter;
      } catch (error) {
        console.error(`[mail] SMTP verification failed: ${error.message}`);
      }
    } else {
      console.error(
        "[mail] SMTP not configured (MAIL_HOST / MAIL_USERNAME / MAIL_PASSWORD missing)"
      );
    }

    if (!IS_PRODUCTION) {
      try {
        const { transport, account } = await createEtherealTransport();
        transporter = transport;
        usingFallback = true;
        console.warn("[mail] Falling back to Ethereal test inbox (dev only)");
        console.warn(
          `[mail] Sign in at https://ethereal.email  user=${account.user} pass=${account.pass}`
        );
        return transporter;
      } catch (error) {
        console.error(
          `[mail] Could not create Ethereal fallback: ${error.message}`
        );
      }
    }

    return null;
  })();

  return initPromise;
};

/* ------------------------------------------------------------------ */
/* Sending                                                            */
/* ------------------------------------------------------------------ */

const sendMail = async ({ to, subject, template = "otp", data = {} }) => {
  const transport = await initMailer();
  const html = renderEmail(template, { ...data, subject });

  if (!transport) {
    const reason = "no mail transport available";
    console.error(`[mail] Not sent to ${to}: ${reason}`);
    if (!IS_PRODUCTION && data.otp) {
      console.log(`[mail][dev] OTP for ${to}: ${data.otp}`);
    }
    throw new Error(reason);
  }

  const info = await transport.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    html,
    text: data.text,
  });

  const previewUrl = usingFallback ? nodemailer.getTestMessageUrl(info) : null;

  if (!IS_PRODUCTION) {
    console.log(`[mail] Sent "${subject}" to ${to} (id=${info.messageId})`);
    if (previewUrl) console.log(`[mail][dev] Preview: ${previewUrl}`);
    if (data.otp) console.log(`[mail][dev] OTP for ${to}: ${data.otp}`);
  }

  return { delivered: true, messageId: info.messageId, previewUrl };
};

/**
 * Send the one-time passcode used for email verification, password reset and
 * two-factor login.
 */
const OTP_COPY = {
  reset: {
    subject: "password reset code",
    intro: "reset your password",
    ignore: "request a password reset",
  },
  login: {
    subject: "login code",
    intro: "finish signing in to your account",
    ignore: "sign in",
  },
  verification: {
    subject: "verification code",
    intro: "verify your email address",
    ignore: "create an account",
  },
};

const sendOtpEmail = async ({
  to,
  firstName,
  otp,
  purpose = "verification",
  expiresInMinutes = 10,
}) => {
  const appName = APP_NAME;
  const copy = OTP_COPY[purpose] || OTP_COPY.verification;
  const subject = `${appName} ${copy.subject}`;

  return sendMail({
    to,
    subject,
    template: "otp",
    data: {
      otp,
      firstName,
      expiresInMinutes,
      subject,
      previewText: `Your ${appName} code is ${otp}`,
      intro: `Use the code below to ${copy.intro}.`,
      ignoreText: copy.ignore,
      text: `Your ${appName} code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    },
  });
};

module.exports = {
  initMailer,
  sendMail,
  sendOtpEmail,
  renderEmail,
};
