import type { Login, Register } from "@jogo-do-bixo/schema";
import bcrypt from "bcrypt";
import { ConflictError, UnauthorizedError } from "../../error";
import type { UserService } from "../users/users.service";

export class AuthService {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async register(data: Register) {
    const existing = await this.userService.findByEmail(data.email);

    if (existing) {
      throw new ConflictError("Este email já está em uso");
    }

    const password = await bcrypt.hash(data.password, 10);

    const avatar = await this.getRandomAvatar();

    const user = await this.userService.create({
      username: data.username,
      email: data.email,
      password: password,
      avatar_url: avatar,
      role: "player",
      balance: 10000,
    });

    return user;
  }

  async ensureDefaultAdmin() {
    const adminEmail = "admin@bicho.com";

    const existing = await this.userService.findByEmail(adminEmail);
    if (existing) {
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await this.userService.create({
      username: "Bicheiro Chefe",
      email: adminEmail,
      password: hashedPassword,
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      role: "admin",
      balance: 99999999, // Dinheiro infinito pra pagar a banca (ele é a banca)
    });
  }

  async login(data: Login) {
    const user = await this.userService.findByEmail(data.email);

    if (!user) throw new UnauthorizedError("Credenciais inválidas");

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) throw new UnauthorizedError("Credenciais inválidas");

    return user;
  }

  async getRandomAvatar() {
    try {
      // API de raposas aleatórias
      const res = await fetch("https://randomfox.ca/floof/");
      const data = (await res.json()) as { image: string };
      return data.image;
    } catch (_) {
      return "https://via.placeholder.com/200"; // Fallback
    }
  }
}
