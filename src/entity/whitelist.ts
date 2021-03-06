import {
    Column, Entity, PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class Whitelist {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column("text")
    public serverID!: string;

    @Column("text")
    public whitelistedRole!: string;

    @Column("text")
    public roleGroup!: string;
}
