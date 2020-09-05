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
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // const hashedPassword = password
    const { username, password } = options;

    if (username.length <= 2) {
      return {
        errors: [{field: "username", message: "Username must be greater than two characters"}]
      }
    }
    if (password.length <= 2) {
      return {
        errors: [{field: "password", message: "Password must be greater than two characters"}]
      }
    }

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, { username, password: hashedPassword });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }
    return { user };
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
        errors: [{ message: error, field: "Unknown" }],
      };
    }
  }
}
