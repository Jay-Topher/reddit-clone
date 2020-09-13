import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({unique: true})
  username!: string;

  @Column()
  password!: string;

  @Field()
  @Column({unique: true})
  email!: string;

  @OneToMany(() => Post, post => post.creator)
  posts: Post[]

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
