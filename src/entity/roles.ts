import {
    Column, Entity, PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class Roles {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column("text")
    public serverID!: string;

    @Column("text")
    public roleID!: string;

    @Column("text")
    public roleGroup!: string;


    @Column("text", { "nullable": true })
    public description!: string | null;

}
