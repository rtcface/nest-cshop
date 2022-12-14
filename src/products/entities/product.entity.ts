import { User } from "../../auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity({name:'catProducts'})
export class Product {
    
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('varchar', {unique:true})
    title:string;

    @Column('float', { default: 0 })
    price:number;
    
    @Column({
        type:'varchar',
        nullable: true
    })
    description: string;
    
    @Column('text',{
        unique:true
    } )
    slug: string;

    @Column('int', { default: 0 })
    stock:number;

    @Column('text',{
        array:true
    })
    sizes: string[];
    
    @Column('text')
    gender:string;

    @Column('text',{ 
        array:true,
        default:[]
     })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { 
            cascade:true,
            eager:true       
        }

     )
    images:ProductImage[];

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        {eager:true}
    )
    user: User


    @BeforeInsert()
    checkSlugInsert(){

        if (!this.slug){
            this.slug=this.title;
        }          

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'');
    }
    @BeforeUpdate()
    checkUpdate(){
        if (!this.slug){
            this.slug=this.title;
        }          

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'');
    }
}

