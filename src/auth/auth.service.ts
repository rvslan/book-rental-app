import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto, SignupDto } from "./dto";
import { JwtPayload, Tokens } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  /**
   * Sign up a user using local authentication (email and password)
   * @param dto - Authentication DTO containing email and password
   * @returns Authentication tokens (access token and refresh token)
   */
  async signupLocal(dto: SignupDto): Promise<Tokens> {
    // Hash the password using bcrypt
    const saltRounds = this.config.get<number>("SALT_ROUNDS");
    const hash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user
      .create({
        data: {
          email: dto.email,
          hash,
          bookstoreId: dto.bookstoreId,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new ForbiddenException("Credentials incorrect");
          }
        }
        throw error;
      });

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  /**
   * Sign in a user using local authentication (email and password)
   * @param dto - Authentication DTO containing email and password
   * @returns Authentication tokens (access token and refresh token)
   */
  async signinLocal(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException("Access Denied");

    // Check if the user exists and the password is valid
    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches) {
      throw new ForbiddenException("Access Denied");
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  /**
   * Logout a user by removing the hashed refresh token
   * @param userId - User ID
   * @returns True if logout is successful
   */
  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return true;
  }

  /**
   * Refresh authentication tokens using a valid refresh token
   * @param userId - User ID
   * @param rt - Refresh token
   * @returns Authentication tokens (access token and refresh token)
   */
  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException("Access Denied");

    const rtMatches = bcrypt.compareSync(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException("Access Denied");

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  /**
   * Update the hashed refresh token for a user
   * @param userId - User ID
   * @param rt - Refresh token
   */
  async updateRtHash(userId: number, rt: string): Promise<void> {
    const saltRounds = this.config.get<number>("SALT_ROUNDS");
    const hash = await bcrypt.hash(rt, saltRounds);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  /**
   * Generate authentication tokens (access token and refresh token) for a user
   * @param userId - User ID
   * @param email - User email
   * @returns Authentication tokens (access token and refresh token)
   */
  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>("AT_SECRET"),
        expiresIn: "60m",
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>("RT_SECRET"),
        expiresIn: "7d",
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
