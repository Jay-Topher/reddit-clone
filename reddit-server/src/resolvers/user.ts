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
import { EntityManager } from "@mikro-orm/postgresql";

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
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // not logged in
    if (!req.session!.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session!.userId });

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    // const hashedPassword = password
    const { username, password } = options;

    if (username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Username must be greater than two characters",
          },
        ],
      };
    }
    if (password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "Password must be greater than two characters",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(password);
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result[0];
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

    // store user id session
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
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
      if (!samePassword) {
        return {
          errors: [{ message: "Incorrect credentials", field: "password" }],
        };
      } else {
        // store user Id session
        // set a cookie on the user
        // keep them logged in
        req.session.userId = user.id;
        return {
          user,
        };
      }
    } catch (error) {
      return {
        errors: [{ message: error, field: "Unknown" }],
      };
    }
  }
}
