import { Product } from "../../products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('catUsers')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('varchar', {unique: true})
    email: string;

    @Column('varchar',{
        select: false 
    })
    password: string;

    @Column('varchar')
    fullName: string;

    @Column('boolean',{
        default: true
    })
    isActive: boolean;

    @Column('varchar',{
        array:true,
        default:['user']
    })
    roles: string[];

    @OneToMany( 
        () => Product,
        ( product ) => product.user )
    product: Product;


    @BeforeInsert()
    checkCleanEmail(){
        this.email=this.email.toLowerCase().trim()
    }

    @BeforeUpdate()
    checkUpdateEmail(){
        this.checkCleanEmail();
    }

}
