const { signToken } = require("../utils/jwt");
const { generateOTP } = require("../utils/otp");
const authService = require("../services/auth.service");
const mailer  =  require("../config/mail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");


/* REGISTER SECTION */
exports.register = async (req, res) => {
    const token = crypto.randomBytes(32).toString("hex");

    await authService.createUser({...req.body, token });

    await mailer.sendMail({
        to: req.body.email,
        subject: "Verify your email",
        html: `<p>Verification token: ${token}</p>` 
    });

    res.status(201).json({message: "Registered. Verify your email."})
};

/* VERIFY EMAIL SECTION */
exports.verifyEmail = async (req, res)  => {
    const verified = await authService.verifyEmail(req.params.token);
    if (!verified)
        return res.status(400).json({message: "Invalid token"})
    res.json({message: "Email verified"});
}

/*LOGIN SECTION */
exports.login = async (req, res) => {
    const user = await authService.findUserByEmail(req.body.email);
    if (!user || !user.is_verified)
        return res.status(401).json({message: "Invalid credentials"});

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match)
        return res.status(401).json({message: "Invalid credentials"});

    const token = signToken({ id: user.id})
    res.json({ token })
};

/* SEND OTP SECTION */
exports.sendResetOTP = async (req, res) =>  {
    const otp = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000;

    const saved = await authService.saveOTP(req.body.email, otp, expires);
    if(!saved)
        return res.status(404).json({message: "Email not found"});

    await mailer.sendmail({
        to: req.body.email,
        subject: "Password Reset OTP",
        html: `
        <h2>${otp}</h2>
        <p>Valid for 10 minutes</p>
        `
    });

    res.json({message: "OTP has been sent to your email"});
};

/*VERIFY OTP AND RESET SECTION */
exports.resetPassword = async (req, res) => {
    const  { email, otp, password } = req.body;

    const success = await authService.verifyOTPAndReset(email, otp, password)
    if(!success)
        return res.status(400).json({message: "Invalid or expired OTP"});

    res.json({message: "Password reset successful"});
};



