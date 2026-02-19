const jwt = require("jsonwebtoken");

const config = require("@/config/app.config");

const jwtConfig = {
  accessSecret: config.jwt.accessSecret,
  refreshSecret: config.jwt.refreshSecret,
  accessExpiresIn: config.jwt.accessExpiresIn,
  refreshExpiresIn: config.jwt.refreshExpiresIn,
  algorithm: config.jwt.algorithm,
};

const User = require("@/models/user.model");
const RevokedToken = require("@/models/revokedToken.model");

class AuthService {
  /**
   * Tạo access token
   */
  generateAccessToken(user) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    return jwt.sign(payload, jwtConfig.accessSecret, {
      expiresIn: jwtConfig.accessExpiresIn, // token hết hạn
      algorithm: jwtConfig.algorithm, // thuật toan mã hóa
    });
  }

  /**
   * Tạo refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      sub: user.id,
      type: "refresh",
    };

    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn, // token hết hạn
      algorithm: jwtConfig.algorithm, // thuật toan mã hóa
    });
  }

  /**
   * Tạo cả hai tokens
   */
  generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: jwtConfig.accessExpiresIn,
    };
  }

  /**
   * Xác thực access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, jwtConfig.accessSecret, {
        algorithms: jwtConfig.algorithm,
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Xác thực refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret, {
        algorithms: jwtConfig.algorithm,
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Đăng ký user mới
   */
  async register(userData) {
    const { username, email, password } = userData;

    // Kiểm tra user đã tồn tại chưa (Parallel execution)
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      User.findByEmail(email),
      User.findByUsername(username),
    ]);

    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }

    if (existingUserByUsername) {
      throw new Error("User with this username already exists");
    }

    // Tạo user mới
    const user = await User.create({
      username,
      email,
      password,
    });

    // Tạo tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ...tokens,
    };
  }

  /**
   * Đăng nhập
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Tìm user theo email
    const user = await User.findByEmail(email);
    console.log("User found for login:", user); // Log user để kiểm tra

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Kiểm tra password
    const isMatch = await User.comparePassword(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // Tạo tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ...tokens,
    };
  }

  /**
   * Làm mới token
   */
  async refreshToken(refreshToken) {
    // Xác thực refresh token
    const decoded = this.verifyRefreshToken(refreshToken);

    if (!decoded) {
      throw new Error("Invalid or expired refresh token");
    }

    // kiểm tra token có bị thu hồi không trước khi tạo token mới để đảm bảo an toàn
    const isRevoked = await RevokedToken.isRevoked(refreshToken);

    if (isRevoked) {
      throw new Error("Refresh token has been revoked");
    }

    // Lấy user
    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new Error("User not found");
    }

    // Thu hồi refresh token cũ
    await this.revokeToken(refreshToken);

    // Tạo tokens mới
    const tokens = this.generateTokens(user);

    return tokens;
  }

  /**
   * Đăng xuất
   */
  async logout(accessToken) {
    // Xác thực token
    const decoded = this.verifyAccessToken(accessToken);

    if (!decoded) {
      throw new Error("Invalid token");
    }

    // Thu hồi token
    await this.revokeToken(accessToken);
  }

  /**
   * Kiểm tra token có bị thu hồi không
   */
  async isTokenRevoked(token) {
    return await RevokedToken.isRevoked(token);
  }

  /**
   * Thu hồi token
   */
  async revokeToken(token) {
    const decoded = jwt.decode(token);

    if (decoded && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);

      await RevokedToken.revoke({
        token,
        expiresAt,
      });
    }
  }
}

module.exports = new AuthService();
