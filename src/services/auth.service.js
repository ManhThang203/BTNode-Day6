const jwt = require("jsonwebtoken");

const config = require("@/config/app.config");

const jwtConfig = {
  accessSecret: config.JWT.accessSecret,
  refreshSecret: config.JWT.refreshSecret,
  verifyEmailSecret: config.JWT.verifyEmailSecret,
  accessExpiresIn: config.JWT.accessExpiresIn,
  verifyEmailExpiresIn: config.JWT.verifyEmailExpiresIn,
  refreshExpiresIn: config.JWT.refreshExpiresIn,
  algorithm: config.JWT.algorithm,
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
        algorithms: jwtConfig.algorithm, // đảm bảo chỉ chấp nhận token được mã hóa bằng thuật toán đã định nghĩa
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Xác thực refresh token
   * có liên quan với hàm generateRefreshToken
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret, {
        algorithms: jwtConfig.algorithm, // đảm bảo chỉ chấp nhận token được mã hóa bằng thuật toán đã định nghĩa
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Tạo verify token cho email
   */
  generateVerifyToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      type: "verify",
    };

    return jwt.sign(payload, jwtConfig.verifyEmailSecret, {
      expiresIn: jwtConfig.verifyEmailExpiresIn,
      algorithm: jwtConfig.algorithm,
    });
  }

  /**
   * Xác thực verify token
   */
  verifyVerifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.verifyEmailSecret, {
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
      // Nếu user đã tồn tại nhưng chưa xác thực email, cho phép đăng ký lại
      if (!existingUserByEmail.verified_at) {
        await User.delete(existingUserByEmail.id);
      } else {
        throw new Error("User with this email already exists");
      }
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
    // user: { id, username, email } sẽ được dùng làm payload để tạo token,
    // giúp token mang thông tin người dùng cần thiết mà không cần truy vấn database nhiều lần
    const tokens = this.generateTokens(user);

    // Tạo verifyToken cho email
    const verifyToken = this.generateVerifyToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      verifyToken,
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
    console.log("User found for login:", user); // Log thông tin user tìm được

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
        verified_at: !!user.verified_at,
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
   * Thu hồi token
   */
  async revokeToken(token) {
    // jwt.decode để đọc nội dung bên trong token mà không cần verify.
    // Kết quả trả về dạng: { sub: userId, iat: timestamp, exp: timestamp }
    const decoded = jwt.decode(token);
    // Nếu token có thông tin và  exp (thời gian hết hạn),
    if (decoded && decoded.exp) {
      // Chuyển đổi thời gian hết hạn
      const expiresAt = new Date(decoded.exp * 1000);

      // Lưu token vào danh sách thu hồi với thời gian hết hạn để tự động xóa sau này
      await RevokedToken.revoke({
        token,
        expiresAt,
      });
    }
  }
}

module.exports = new AuthService();
