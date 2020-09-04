import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  InputType,
  Field,
  Query,
  ObjectType,
} from "type-graphql";
import { User } from "../entites/User";
import { MyContext } from "../types";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<User> {
    // const hashedPassword = password
    const { username, password } = options;

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, { username, password: hashedPassword });
    await em.persistAndFlush(user);
    return user;
  }

  @Query(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;
    const user = await em.findOne(User, { username });
    if (!user) {
      return {
        errors: [{ message: "User not found", field: "username" }],
      };
    }
    try {
      const samePassword = await argon2.verify(user.password, password);
      if (samePassword) {
        return {
          user,
        };
      } else {
        return {
          errors: [{ message: "Incorrect credentials", field: "password" }],
        };
      }
    } catch (error) {
      return {
        errors: [{message: error, field: "Unknown"}]
      }
    }
  }
}
