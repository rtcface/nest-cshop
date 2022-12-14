import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { initialData } from '../seed/seed-data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();

    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);

    return 'EXECUTE SEED';
  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      const { password, ...userData } = user;
      let pass = this.cryptPassword(password);
      users.push(this.userRepository.create({
        ...userData,
        password: pass
      }));
    });
    console.log(users);
    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.productService.ResetProducts();
    const products = initialData.products;

    const insertPromise = [];

    products.forEach((product) => {
      insertPromise.push(this.productService.create(product, user));
    });

    await Promise.all(insertPromise);

    return true;
  }

  private async deleteTables() {
    await this.productService.ResetProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();
  }

  private  cryptPassword (pass:string):string{
    const cryptPass =  bcrypt.hashSync(pass, 5);
    return cryptPass;
  }
}
