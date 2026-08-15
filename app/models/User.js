const db = require("../config/db");

class User {
    static async create(userData) {
        const {
            firstName,
            lastName,
            email,
            password,
            verificationOtp,
            verificationOtpExpired,
            isVerified,
            role,
        } = userData;

        const [result] = await db.execute(
            `INSERT INTO users
            (firstName, lastName, email, password, verificationOtp,
            verificationOtpExpired, isVerified, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                firstName,
                lastName,
                email,
                password,
                verificationOtp,
                verificationOtpExpired,
                isVerified,
                role,
            ]
        );

        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        return rows[0];
    }
}

module.exports = User;